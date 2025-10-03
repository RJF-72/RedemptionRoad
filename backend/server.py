import os
import uuid
import threading
from typing import Dict
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware

try:
    # When running as a package (uvicorn backend.server:app)
    from .video_pipeline import build_music_video  # type: ignore
except Exception:
    # Fallback for direct/script execution contexts
    try:
        # Prefer package-relative import
        from .video_pipeline import build_music_video  # type: ignore
    except Exception:
        # Fallback when run as a script: PYTHONPATH includes backend dir
        from video_pipeline import build_music_video  # type: ignore
import io
import wave
import numpy as np
from pydub import AudioSegment
import random
import re

def _read_audio_bytes(b: bytes) -> tuple[np.ndarray, int]:
    # Try fast WAV path first
    try:
        with wave.open(io.BytesIO(b), 'rb') as w:
            sr = w.getframerate()
            n = w.getnframes()
            ch = w.getnchannels()
            sampwidth = w.getsampwidth()
            frames = w.readframes(n)
        dtype = {1: np.int8, 2: np.int16, 4: np.int32}.get(sampwidth)
        if dtype is None:
            raise ValueError("Unsupported sample width")
        audio = np.frombuffer(frames, dtype=dtype).astype(np.float32)
        if ch > 1:
            audio = audio.reshape(-1, ch).mean(axis=1)
        maxv = np.max(np.abs(audio)) or 1.0
        audio = audio / maxv
        return audio, sr
    except Exception:
        # Fallback: decode with pydub (supports mp3, flac, ogg, etc.)
        seg = AudioSegment.from_file(io.BytesIO(b))
        sr = seg.frame_rate
        ch = seg.channels
        samples = np.array(seg.get_array_of_samples(), dtype=np.float32)
        if ch > 1:
            samples = samples.reshape(-1, ch).mean(axis=1)
        # normalize to [-1,1] based on sample width
        max_possible = float(1 << (8 * seg.sample_width - 1))
        audio = (samples / max_possible).astype(np.float32)
        maxv = np.max(np.abs(audio)) or 1.0
        audio = audio / maxv
        return audio, sr

def _frame_signal(x: np.ndarray, sr: int, win_ms: float = 25.0, hop_ms: float = 10.0):
    win = int(sr * win_ms / 1000.0)
    hop = int(sr * hop_ms / 1000.0)
    if win <= 0 or hop <= 0:
        raise ValueError("Invalid window/hop")
    n_frames = max(1, 1 + (len(x) - win) // hop)
    frames = np.zeros((n_frames, win), dtype=np.float32)
    for i in range(n_frames):
        start = i * hop
        end = start + win
        if end <= len(x):
            frames[i, :] = x[start:end]
        else:
            pad = end - len(x)
            seg = np.zeros(win, dtype=np.float32)
            seg[: win - pad] = x[start:len(x)]
            frames[i, :] = seg
    return frames

def _power_spectrum(frames: np.ndarray):
    # Hanning window + magnitude squared FFT
    window = np.hanning(frames.shape[1]).astype(np.float32)
    fft = np.fft.rfft(frames * window[None, :], axis=1)
    ps = (np.abs(fft) ** 2).astype(np.float32)
    return ps

def _mel_filterbank(n_fft: int, sr: int, n_mels: int = 40, fmin: float = 20.0, fmax: float | None = None):
    if fmax is None:
        fmax = sr / 2
    def hz_to_mel(f):
        return 2595.0 * np.log10(1 + f / 700.0)
    def mel_to_hz(m):
        return 700.0 * (10**(m / 2595.0) - 1)
    mels = np.linspace(hz_to_mel(fmin), hz_to_mel(fmax), n_mels + 2)
    hz = mel_to_hz(mels)
    bins = np.floor((n_fft + 1) * hz / sr).astype(int)
    fb = np.zeros((n_mels, n_fft // 2 + 1), dtype=np.float32)
    for m in range(1, n_mels + 1):
        f_m_minus, f_m, f_m_plus = bins[m - 1], bins[m], bins[m + 1]
        if f_m == f_m_minus: f_m += 1
        for k in range(f_m_minus, f_m):
            if 0 <= k < fb.shape[1]:
                fb[m - 1, k] = (k - f_m_minus) / max(1, (f_m - f_m_minus))
        for k in range(f_m, f_m_plus):
            if 0 <= k < fb.shape[1]:
                fb[m - 1, k] = (f_m_plus - k) / max(1, (f_m_plus - f_m))
    return fb

def _mfcc(x: np.ndarray, sr: int, n_mfcc: int = 13, n_mels: int = 40):
    frames = _frame_signal(x, sr)
    ps = _power_spectrum(frames)
    fb = _mel_filterbank((frames.shape[1]//2)*2, sr, n_mels)
    mel_spec = np.dot(ps, fb.T) + 1e-9
    log_mel = np.log(mel_spec)
    # DCT-II
    n = log_mel.shape[1]
    k = np.arange(n)
    mfccs = []
    for i in range(n_mfcc):
        basis = np.cos(np.pi * i * (2 * k + 1) / (2 * n))
        mfccs.append((log_mel * basis[None, :]).sum(axis=1))
    mfcc = np.stack(mfccs, axis=1).astype(np.float32)
    # mean-variance normalization per coefficient
    mu = mfcc.mean(axis=0, keepdims=True)
    sigma = mfcc.std(axis=0, keepdims=True) + 1e-6
    return (mfcc - mu) / sigma

def _dtw_distance(A: np.ndarray, B: np.ndarray) -> float:
    # Simple DTW over frame sequences using L2 frame distance
    n, m = A.shape[0], B.shape[0]
    D = np.full((n + 1, m + 1), np.inf, dtype=np.float32)
    D[0, 0] = 0.0
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            cost = np.linalg.norm(A[i - 1] - B[j - 1])
            D[i, j] = cost + min(D[i - 1, j], D[i, j - 1], D[i - 1, j - 1])
    return float(D[n, m] / (n + m))

def _chroma_from_ps(ps: np.ndarray, sr: int) -> np.ndarray:
    # ps: (frames, n_bins), freqs 0..sr/2
    freqs = np.linspace(0, sr/2, ps.shape[1], dtype=np.float32)
    valid = freqs > 0
    freqs = freqs[valid]
    if len(freqs) == 0:
        return np.zeros((ps.shape[0], 12), dtype=np.float32)
    midi = 69.0 + 12.0 * np.log2(freqs / 440.0)
    bins = (np.round(midi) % 12).astype(int)
    chroma = np.zeros((ps.shape[0], 12), dtype=np.float32)
    for ci in range(12):
        mask = (bins == ci)
        if mask.any():
            chroma[:, ci] = ps[:, valid][:, mask].sum(axis=1)
    # normalize per-frame
    chroma = chroma + 1e-9
    chroma = chroma / chroma.sum(axis=1, keepdims=True)
    return chroma

def audio_authenticity_score(wav_a: bytes, wav_b: bytes, profile: str = "general") -> dict:
    try:
        xa, sra = _read_audio_bytes(wav_a)
        xb, srb = _read_audio_bytes(wav_b)
    except Exception as e:
        return {"error": f"Invalid WAV input: {e}"}
    # Simple resample guard: if rates differ, trim or stretch by naive repeat (avoid scipy dep)
    if sra != srb:
        # resample by linear interpolation to min sr
        target = min(sra, srb)
        def _resample(x, sr):
            if sr == target: return x
            t_old = np.linspace(0, len(x) / sr, num=len(x), endpoint=False)
            t_new = np.linspace(0, len(x) / sr, num=int(len(x) * target / sr), endpoint=False)
            return np.interp(t_new, t_old, x).astype(np.float32)
        xa = _resample(xa, sra)
        xb = _resample(xb, srb)
        sra = srb = target
    # Length align: center-trim longer to match shorter for feature extraction
    L = min(len(xa), len(xb))
    if L < sra * 0.5:
        return {"error": "Audio too short; provide >=0.5s clips"}
    xa = xa[:L]
    xb = xb[:L]
    fa = _mfcc(xa, sra)
    fb = _mfcc(xb, srb)
    dtw = _dtw_distance(fa, fb)
    # Also compute simple spectral centroid correlation as a secondary feature
    def _centroid(x, sr):
        frames = _frame_signal(x, sr)
        ps = _power_spectrum(frames)
        freqs = np.linspace(0, sr/2, ps.shape[1], dtype=np.float32)
        num = (ps * freqs[None, :]).sum(axis=1)
        den = ps.sum(axis=1) + 1e-9
        return (num / den)
    ca = _centroid(xa, sra)
    cb = _centroid(xb, srb)
    # correlation in [-1,1]
    corr = float(np.corrcoef(ca, cb)[0,1]) if ca.std() > 1e-6 and cb.std() > 1e-6 else 0.0
    # Map distances to similarity [0,1]; smaller dtw -> higher similarity
    # Heuristic scaling: dtw ~ 0..50 typical; clamp
    sim_dtw = max(0.0, min(1.0, 1.0 - (dtw / 50.0)))
    sim_corr = (corr + 1.0) / 2.0
    # Optional chroma similarity for melodic content (e.g., guitars/pianos)
    sim_chroma = None
    if profile.lower() == "melodic":
        # reuse frames/spectrum to build chroma
        frames_a = _frame_signal(xa, sra)
        ps_a = _power_spectrum(frames_a)
        frames_b = _frame_signal(xb, srb)
        ps_b = _power_spectrum(frames_b)
        ca = _chroma_from_ps(ps_a, sra).mean(axis=0)
        cb = _chroma_from_ps(ps_b, srb).mean(axis=0)
        # cosine similarity in [0,1]
        na = np.linalg.norm(ca) + 1e-9
        nb = np.linalg.norm(cb) + 1e-9
        sim_chroma = float(np.dot(ca, cb) / (na * nb))
        sim_chroma = max(0.0, min(1.0, sim_chroma))
        sim = 0.6 * sim_dtw + 0.2 * sim_corr + 0.2 * sim_chroma
    elif profile.lower() == "percussive":
        # Percussive weighting: spectral flux and envelope similarity
        def _spectral_flux(x, sr):
            fr = _frame_signal(x, sr)
            ps = _power_spectrum(fr)
            # L2 diff between consecutive magnitude spectra
            d = np.diff(ps, axis=0)
            d = np.maximum(d, 0)
            flux = np.sqrt((d**2).sum(axis=1))
            if len(flux) < 2:
                return np.zeros(1, dtype=np.float32)
            # normalize
            flux = (flux - flux.mean()) / (flux.std() + 1e-6)
            return flux
        def _envelope(x, sr):
            # RMS over frames
            fr = _frame_signal(x, sr)
            rms = np.sqrt((fr**2).mean(axis=1) + 1e-9)
            rms = (rms - rms.mean()) / (rms.std() + 1e-6)
            return rms
        fa_flux = _spectral_flux(xa, sra)
        fb_flux = _spectral_flux(xb, srb)
        # align lengths
        Lf = min(len(fa_flux), len(fb_flux))
        fa_flux = fa_flux[:Lf]; fb_flux = fb_flux[:Lf]
        flux_corr = float(np.corrcoef(fa_flux, fb_flux)[0,1]) if Lf > 2 else 0.0
        flux_corr = max(-1.0, min(1.0, flux_corr))
        flux_sim = (flux_corr + 1.0) / 2.0
        fa_env = _envelope(xa, sra)
        fb_env = _envelope(xb, srb)
        Le = min(len(fa_env), len(fb_env))
        fa_env = fa_env[:Le]; fb_env = fb_env[:Le]
        env_corr = float(np.corrcoef(fa_env, fb_env)[0,1]) if Le > 2 else 0.0
        env_corr = max(-1.0, min(1.0, env_corr))
        env_sim = (env_corr + 1.0) / 2.0
        sim = 0.6 * sim_dtw + 0.25 * flux_sim + 0.15 * env_sim
    else:
        sim = 0.7 * sim_dtw + 0.3 * sim_corr
    result = {
        "authenticity_percent": round(float(sim * 100.0), 2),
        "similarity": {
            "dtw_based": round(float(sim_dtw), 4),
            "centroid_corr": round(float(sim_corr), 4)
        },
        "dtw_raw": round(float(dtw), 4),
        "profile": profile
    }
    if sim_chroma is not None:
        result["similarity"]["chroma_cosine"] = round(float(sim_chroma), 4)
    if profile.lower() == "percussive":
        result["similarity"]["spectral_flux_corr"] = round(float((flux_corr+1.0)/2.0), 4) if 'flux_corr' in locals() else None
        result["similarity"]["envelope_corr"] = round(float((env_corr+1.0)/2.0), 4) if 'env_corr' in locals() else None
    return result

app = FastAPI()
# In dev we allow any origin; for production replace with specific domain(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

JOBS: Dict[str, Dict] = {}

@app.get('/api/health')
async def health():
    return {"status": "ok"}

@app.post('/api/generate/start')
async def start_generate(
    audio: UploadFile = File(...),
    genre: str = Form('pop'),
    style: str = Form('cinematic'),
    palette: str = Form('warm'),
    seed: int | None = Form(None)
):
    job_id = str(uuid.uuid4())
    job_dir = os.path.join('jobs', job_id)
    os.makedirs(job_dir, exist_ok=True)
    audio_path = os.path.join(job_dir, audio.filename)

    with open(audio_path, 'wb') as f:
        f.write(await audio.read())

    JOBS[job_id] = {"status": "queued", "progress": 0, "result": None, "error": None}

    def worker():
        try:
            JOBS[job_id]["status"] = "running"
            JOBS[job_id]["progress"] = 10
            out_path = build_music_video(audio_path, genre, style, palette, seed=seed, work_dir=job_dir)
            JOBS[job_id]["progress"] = 100
            JOBS[job_id]["status"] = "done"
            JOBS[job_id]["result"] = out_path
        except Exception as e:
            JOBS[job_id]["status"] = "error"
            JOBS[job_id]["error"] = str(e)

    threading.Thread(target=worker, daemon=True).start()

    return {"job_id": job_id}

@app.get('/api/generate/status')
async def get_status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        return JSONResponse({"error": "job not found"}, status_code=404)
    return job

@app.get('/api/generate/result')
async def get_result(job_id: str):
    job = JOBS.get(job_id)
    if not job or not job.get("result"):
        return JSONResponse({"error": "result not ready"}, status_code=404)
    return FileResponse(job["result"], media_type='video/mp4', filename='music_video.mp4')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)

@app.post('/api/audio/authenticity')
async def api_audio_authenticity(
    reference: UploadFile = File(...),
    candidate: UploadFile = File(...),
    profile: str = Form("general")
):
    ref_bytes = await reference.read()
    cand_bytes = await candidate.read()
    result = audio_authenticity_score(ref_bytes, cand_bytes, profile=profile)
    if "error" in result:
        return JSONResponse(result, status_code=400)
    return result

# -----------------------------
# Songwriter: prompt -> structured song
# -----------------------------

ROMAN_NUMS = {
    'I': 0, 'ii': 2, 'II': 2, 'iii': 4, 'III': 4, 'IV': 5, 'V': 7, 'vi': 9, 'VI': 9, 'vii°': 11, 'VII': 11,
    'i': 0, '♭VII': 10, 'bVII': 10
}

KEYS_MAJOR = [
    'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'
]
KEYS_MINOR = [
    'A minor', 'E minor', 'B minor', 'F# minor', 'C# minor', 'G# minor', 'D# minor', 'Bb minor', 'F minor', 'C minor', 'G minor', 'D minor'
]

SCALE_MAJOR = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

def transpose_degree(root_idx: int, semis: int) -> str:
    idx = (root_idx + semis) % 12
    return SCALE_MAJOR[idx]

def key_root_index(key: str) -> tuple[int, bool]:
    is_minor = 'minor' in key.lower()
    root = key.split()[0]
    try:
        idx = SCALE_MAJOR.index(root if root != 'Cb' else 'B')
    except ValueError:
        idx = 0
    return idx, is_minor

def roman_to_chord(roman: str, key: str) -> str:
    base_map_major = {
        'I': 0, 'ii': 2, 'iii': 4, 'IV': 5, 'V': 7, 'vi': 9, 'vii°': 11,
        'bVII': 10, '♭VII': 10, 'III': 4, 'II': 2, 'VII': 11
    }
    base_map_minor = {
        'i': 0, 'ii': 2, 'III': 3, 'iv': 5, 'v': 7, 'VI': 8, 'VII': 10,
        'bVII': 10, '♭VII': 10
    }
    idx, is_minor = key_root_index(key)
    base = base_map_minor if is_minor else base_map_major
    semis = base.get(roman, 0)
    chord = transpose_degree(idx, semis)
    # basic quality annotations (very simplified)
    if is_minor:
        qualities = {'i', 'iv', 'v'}
    else:
        qualities = {'ii', 'iii', 'vi'}
    q = ''
    if (not is_minor and roman in qualities) or (is_minor and roman in qualities):
        q = 'm'
    if '°' in roman:
        q = 'dim'
    return f"{chord}{q}"

GENRE_PROGRESSIONS = {
    'pop': ['I–V–vi–IV', 'vi–IV–I–V'],
    'country': ['I–IV–V–IV', 'I–V–IV–V'],
    'rock': ['I–bVII–IV–I', 'I–IV–V–I'],
    'hip-hop': ['i–VI–III–VII', 'vi–IV–I–V'],
    'edm': ['vi–IV–I–V', 'I–V–vi–IV'],
    'r&b': ['ii–V–I–vi', 'I–vi–IV–V'],
    'jazz': ['ii–V–I–I', 'I–vi–ii–V'],
    'blues': ['I–IV–I–I / IV–IV–I–I / V–IV–I–V'],
    'worship': ['I–V–vi–IV', 'IV–I–V–vi'],
    'folk': ['I–IV–V–I', 'I–V–vi–IV']
}

GENRE_TEMPO = {
    'pop': (90, 120),
    'country': (72, 108),
    'rock': (100, 160),
    'hip-hop': (75, 100),
    'edm': (120, 132),
    'r&b': (70, 95),
    'jazz': (110, 180),
    'blues': (60, 100),
    'worship': (65, 85),
    'folk': (80, 110)
}

RHYMES = [
    ['fire', 'higher', 'wire', 'choir', 'desire'],
    ['light', 'night', 'fight', 'bright', 'alright'],
    ['time', 'rhyme', 'climb', 'sublime', 'shine'],
    ['home', 'alone', 'stone', 'known', 'throne'],
    ['rain', 'pain', 'again', 'remain', 'chain'],
]

STOPWORDS = set('the a an and or but if when then with into onto over under for from to in on at of by as be am are is was were been being this that those these my your our their his her its it we you they i me him her us them just only even still really very'.split())

def pick_key(genre: str, mood: str) -> str:
    if genre in ('hip-hop', 'edm', 'r&b') or mood in ('melancholic', 'dark', 'reflective'):
        return random.choice(KEYS_MINOR)
    return random.choice(KEYS_MAJOR)

def pick_bpm(genre: str) -> int:
    lo, hi = GENRE_TEMPO.get(genre, (90, 120))
    return random.randint(lo, hi)

def roman_string_to_chords(roman_prog: str, key: str) -> list[str]:
    parts = [p.strip() for p in re.split(r'[–\-\s/]+', roman_prog) if p.strip()]
    chords = [roman_to_chord(p, key) for p in parts]
    return chords

def extract_keywords(prompt: str, k: int = 8) -> list[str]:
    words = [re.sub(r"[^a-zA-Z']", '', w).lower() for w in prompt.split()]
    words = [w for w in words if w and w not in STOPWORDS and len(w) > 2]
    # simple frequency-based top-k
    freq: Dict[str, int] = {}
    for w in words:
        freq[w] = freq.get(w, 0) + 1
    ranked = sorted(freq.items(), key=lambda x: (-x[1], -len(x[0])))
    return [w for w, _ in ranked[:k]] or (words[:k] if words else [])

def make_rhymed_lines(base_words: list[str], scheme: str, lines: int) -> list[str]:
    # Build rhyme pools
    pool = random.choice(RHYMES)
    def rhyme_word(i):
        return pool[i % len(pool)]
    # Rotate through keywords
    kw = base_words or ['love', 'road', 'dream', 'fire']
    lines_out = []
    scheme = scheme.upper()
    labels = []
    if scheme == 'AABB':
        labels = ['A','A','B','B']
    elif scheme == 'ABAB':
        labels = ['A','B','A','B']
    elif scheme == 'ABCB':
        labels = ['A','B','C','B']
    else:
        labels = ['F','F','F','F']
    for i in range(lines):
        word = kw[i % len(kw)]
        label = labels[i % len(labels)]
        end = rhyme_word(i if label != 'B' else i+1) if label in ('A','B','C') else random.choice(random.choice(RHYMES))
        prefix = random.choice([
            'I remember', 'We wander', 'I’m chasing', 'Under neon', 'Through the static', 'On the backroads',
            'In the midnight', 'You told me', 'I promised', 'They whispered'
        ])
        mid = random.choice([
            'the {w} we carry', 'a {w} that lingers', 'the echoes of {w}', '{w} and thunder', 'sweet {w} turning'
        ]).format(w=word)
        adorn = random.choice([
            'like it’s meant to be', 'til the morning light', 'in a silver line', 'on a borrowed time', 'with a restless mind'
        ])
        lines_out.append(f"{prefix}, {mid}, {adorn} — {end}")
    return lines_out

def structure_for(genre: str, structure: str | None) -> list[str]:
    if structure:
        s = structure.lower()
        if 'hip' in s:
            return ['Intro','Verse 1','Hook','Verse 2','Bridge','Hook','Outro']
        if 'worship' in s:
            return ['Intro','Verse 1','Chorus','Verse 2','Bridge','Chorus','Outro']
        if 'folk' in s or 'ballad' in s:
            return ['Verse 1','Verse 2','Chorus','Verse 3','Bridge','Chorus']
    # defaults
    if genre in ('hip-hop','r&b'):
        return ['Intro','Verse 1','Hook','Verse 2','Bridge','Hook','Outro']
    return ['Intro','Verse 1','Pre-Chorus','Chorus','Verse 2','Bridge','Chorus','Outro']

@app.post('/api/songwriter')
async def api_songwriter(
    prompt: str = Form(...),
    genre: str = Form('pop'),
    mood: str = Form('uplifting'),
    perspective: str = Form('first-person'),
    rhyme: str = Form('AABB'),
    complexity: str = Form('medium'),
    structure: str = Form('default')
):
    g = genre.lower().strip()
    key = pick_key(g, mood.lower().strip())
    bpm = pick_bpm(g)
    sections = structure_for(g, structure if structure != 'default' else None)
    # choose progression per section
    roman_choices = GENRE_PROGRESSIONS.get(g, GENRE_PROGRESSIONS['pop'])
    base_prog = random.choice(roman_choices)
    chords_by_section: Dict[str, list[str]] = {}
    for sec in sections:
        prog = base_prog
        # Light variation
        if any(x in sec.lower() for x in ('bridge','outro')) and len(roman_choices) > 1:
            prog = roman_choices[1]
        chords_by_section[sec] = roman_string_to_chords(prog, key)
    # Title
    kws = extract_keywords(prompt, k=6)
    title_core = (kws[0] if kws else 'Redemption')
    title = ' '.join([w.capitalize() for w in (random.choice([
        f"{title_core} Road", f"{title_core} Sky", f"{title_core} Fire", f"{title_core} Light", title_core
    ]).split())])
    # Lines per section based on complexity
    lines_map = {'simple': 3, 'medium': 4, 'advanced': 6}
    n_lines = lines_map.get(complexity.lower(), 4)
    lyrics: Dict[str, list[str]] = {}
    for sec in sections:
        if 'intro' in sec.lower() or 'outro' in sec.lower():
            lyrics[sec] = [random.choice([
                'Instrumental motif', 'Vocalise hook (oohs/ahs)', 'Reprise of chorus tagline'
            ])]
            continue
        base_words = kws
        sec_scheme = rhyme if 'chorus' not in sec.lower() and 'hook' not in sec.lower() else 'ABAB'
        lines = make_rhymed_lines(base_words, sec_scheme, n_lines)
        # perspective tweaks
        if perspective.startswith('second'):
            lines = [re.sub(r'\bI\b', 'you', ln, flags=re.I) for ln in lines]
        elif perspective.startswith('third'):
            lines = [re.sub(r'\bI\b', 'they', ln, flags=re.I) for ln in lines]
        # chorus/hook tag line
        if 'chorus' in sec.lower() or 'hook' in sec.lower():
            tagline = ' '.join(random.sample(kws, min(3, len(kws)))) if kws else 'hold on to the light'
            lines.append(f"{tagline.capitalize()} — this is where we rise")
        lyrics[sec] = lines
    # Description
    description = f"{mood.capitalize()} {genre} song about " + (', '.join(kws[:3]) if kws else 'resilience and love')
    # Flatten lyrics for convenience
    plain_lyrics = []
    for sec in sections:
        plain_lyrics.append(f"[{sec}]")
        for ln in lyrics[sec]:
            plain_lyrics.append(ln)
        plain_lyrics.append('')
    payload = {
        'title': title,
        'genre': genre,
        'mood': mood,
        'perspective': perspective,
        'key': key,
        'bpm': bpm,
        'rhyme': rhyme,
        'complexity': complexity,
        'structure': sections,
        'chords': chords_by_section,
        'lyrics': lyrics,
        'description': description,
        'plain_text': '\n'.join(plain_lyrics)
    }
    return payload

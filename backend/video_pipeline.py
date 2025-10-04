import os
import math
from typing import Optional

import numpy as np
from moviepy.editor import AudioFileClip, VideoClip


def _palette_weights(palette: str) -> tuple[float, float, float]:
    p = (palette or "").lower()
    if "warm" in p:
        return (1.0, 0.85, 0.65)
    if "cool" in p or "blue" in p:
        return (0.65, 0.85, 1.0)
    if "neon" in p or "vapor" in p:
        return (1.1, 1.1, 1.1)
    if "mono" in p or "bw" in p:
        return (0.9, 0.9, 0.9)
    return (1.0, 1.0, 1.0)


def build_visualizer_video(
    audio_path: str,
    genre: str,
    style: str,
    palette: str,
    seed: Optional[int] = None,
    work_dir: Optional[str] = None,
) -> str:
    """
    CPU-friendly abstract visualizer that pairs the provided audio with a lightweight
    animated background. Avoids heavy model dependencies and runs on any machine.

    Returns: absolute path to the generated mp4 file.
    """
    work_dir = work_dir or os.path.dirname(os.path.abspath(audio_path))
    os.makedirs(work_dir, exist_ok=True)
    out_path = os.path.join(work_dir, "music_video.mp4")

    # Load audio to infer duration
    audio = AudioFileClip(audio_path)
    duration = max(1.0, float(audio.duration or 1.0))

    # Visual params
    W, H = 1280, 720
    fps = 24
    rw, gw, bw = _palette_weights(palette)
    phase_base = float((seed or 0) % 997) / 997.0
    speed = 0.10 if "slow" in (style or "").lower() else 0.18

    # Precompute grids for efficiency
    x = np.linspace(0.0, 1.0, W, dtype=np.float32)[None, :]
    y = np.linspace(0.0, 1.0, H, dtype=np.float32)[:, None]

    def make_frame(t: float) -> np.ndarray:
        # Smooth phase over time
        ph = phase_base + speed * t
        # Multi-axial sines for organic motion
        r = 0.5 + 0.5 * np.sin(2 * np.pi * (x + 0.75 * y + ph))
        g = 0.5 + 0.5 * np.sin(2 * np.pi * (0.8 * x - 0.6 * y + ph + 0.33))
        b = 0.5 + 0.5 * np.sin(2 * np.pi * (0.5 * x + 0.9 * y - ph + 0.66))

        # Apply palette weighting and gentle vignette
        vignette = 0.85 + 0.15 * (
            np.sin(np.pi * (x - 0.5)) ** 2 + np.sin(np.pi * (y - 0.5)) ** 2
        )
        R = np.clip(r * rw * vignette, 0.0, 1.0)
        G = np.clip(g * gw * vignette, 0.0, 1.0)
        B = np.clip(b * bw * vignette, 0.0, 1.0)
        frame = np.dstack((R, G, B))
        return (frame * 255).astype(np.uint8)

    clip = VideoClip(make_frame, duration=duration)
    clip = clip.set_audio(audio).set_fps(fps)

    # Write using the imageio-ffmpeg binary bundled via imageio_ffmpeg
    clip.write_videofile(
        out_path,
        codec="libx264",
        audio_codec="aac",
        fps=fps,
        bitrate="3000k",
        preset="medium",
        threads=2,
        verbose=False,
        logger=None,
    )

    audio.close()
    clip.close()
    return os.path.abspath(out_path)
import os
import math
import tempfile
from typing import List, Optional
from pydub import AudioSegment
from PIL import Image
from moviepy.editor import (ImageClip, AudioFileClip, concatenate_videoclips, VideoClip, ImageSequenceClip)
import numpy as np

# Optional heavy imports guarded
CPU_ONLY = os.getenv('SOTA_CPU_ONLY', '1') == '1'

try:
    import torch
    from diffusers import StableDiffusionXLPipeline
    _HAS_TORCH = True
    # Tune CPU threads if CPU_ONLY
    if CPU_ONLY and hasattr(torch, 'set_num_threads'):
        try:
            torch.set_num_threads(max(1, (os.cpu_count() or 4) - 1))
        except Exception:
            pass
except Exception:
    torch = None
    StableDiffusionXLPipeline = None
    _HAS_TORCH = False

try:
    from diffusers import StableVideoDiffusionPipeline
    _HAS_SVD = not CPU_ONLY  # Disable SVD when CPU_ONLY to avoid extreme runtimes
except Exception:
    StableVideoDiffusionPipeline = None
    _HAS_SVD = False
_SVD_PIPE = None


def analyze_audio(audio_path: str) -> float:
    audio = AudioSegment.from_file(audio_path)
    return audio.duration_seconds


def build_prompts(genre: str, style: str, palette: str) -> List[str]:
    base = {
        "pop": "vibrant pop music video, energetic, glossy lighting, performance shots",
        "rock": "gritty rock concert, dynamic stage lighting, cinematic smoke, close-up guitars",
        "hip-hop": "urban hip-hop vibe, moody nights, neon city, swagger, high contrast",
        "electronic": "futuristic electronic visuals, lasers, abstract neon shapes, club lighting",
        "country": "country performance, warm golden hour, rustic stage, heartfelt",
        "jazz": "smoky jazz club, moody lighting, cinematic bokeh, vintage atmosphere",
        "classical": "elegant classical hall, dramatic light shafts, refined, cinematic",
        "christian": "uplifting inspirational visuals, soft light, hope, peaceful landscapes",
        "blues": "soulful blues bar, warm tungsten, intimate close-ups",
        "folk": "acoustic folk, natural textures, outdoor scenery, warmth"
    }.get(genre, "cinematic music video, professional lighting, dramatic, detailed")

    style_map = {
        "cinematic": "shot on cinema camera, shallow depth of field, anamorphic bokeh",
        "energetic": "high energy, dynamic camera, motion blur, action",
        "minimalist": "clean compositions, negative space, elegant",
        "artistic": "surreal, painterly textures, experimental",
        "vintage": "film grain, retro color, analog",
        "futuristic": "sci-fi neon, holograms, sleek, modern",
        "dramatic": "high contrast, chiaroscuro, intense",
        "playful": "colorful, whimsical, fun"
    }.get(style, "cinematic")

    palette_map = {
        "warm": "warm tones, gold and amber",
        "cool": "cool tones, teal and blue",
        "monochrome": "monochrome black and white",
        "vibrant": "highly saturated vibrant palette"
    }.get(palette, "balanced palette")

    full = f"{base}, {style_map}, {palette_map}, highly detailed, award-winning, 8k, HDR"

    # Create 6 scene prompts
    return [full + f", scene {i+1}" for i in range(6)]


def _ensure_dir(path: str):
    os.makedirs(path, exist_ok=True)


def generate_images_sdxl(prompts: List[str], out_dir: str, seed: Optional[int] = None) -> List[str]:
    _ensure_dir(out_dir)
    paths = []
    if not _HAS_TORCH or StableDiffusionXLPipeline is None:
        raise RuntimeError(
            "PyTorch and diffusers (SDXL) are required for image generation. "
            "Install a compatible PyTorch build (preferably CUDA) and try again."
        )

    # Enforce CPU-only by default unless explicitly overridden
    device = 'cpu'
    dtype = torch.float32
    if not CPU_ONLY and torch.cuda.is_available():
        device = 'cuda'
        dtype = torch.float16
    pipe = StableDiffusionXLPipeline.from_pretrained(
        'stabilityai/stable-diffusion-xl-base-1.0', torch_dtype=dtype
    ).to(device)

    generator = torch.Generator(device=device)
    if seed is not None:
        generator.manual_seed(seed)

    # CPU-friendly defaults: fewer steps and smaller frames while staying HD-ish
    steps = 18 if device == 'cpu' else 28
    height, width = (432, 768) if device == 'cpu' else (720, 1280)  # 16:9
    for i, prompt in enumerate(prompts):
        image = pipe(
            prompt=prompt,
            num_inference_steps=steps,
            guidance_scale=6.0,
            height=height,
            width=width,
            generator=generator
        ).images[0]
        img_path = os.path.join(out_dir, f"scene_{i+1}.jpg")
        image.save(img_path)
        paths.append(img_path)
    return paths


def ken_burns_clip(image_path: str, duration: float = 5.0) -> VideoClip:
    # Simple zoom/pan effect using VideoClip with a make_frame function
    base_img = Image.open(image_path).convert('RGB')
    w, h = base_img.size
    zoom = 1.1

    def make_frame(t):
        prog = (t / duration) if duration > 0 else 0.0
        scale = 1.0 + (zoom - 1.0) * min(max(prog, 0.0), 1.0)
        rw, rh = int(w * scale), int(h * scale)
        frame = base_img.resize((rw, rh), Image.LANCZOS)
        # Pan from top-left to center
        x = int((rw - w) * prog)
        y = int((rh - h) * prog * 0.5)
        frame = frame.crop((x, y, x + w, y + h))
        return np.array(frame)

    return VideoClip(make_frame, duration=duration)


def build_video_from_images(images: List[str], audio_path: str, out_path: str, target_duration: float) -> str:
    if not images:
        raise ValueError('No images provided')
    # Split target duration across images
    per = max(3.0, target_duration / len(images))

    clips = []
    if _HAS_SVD:
        # Lazy init SVD pipeline
        global _SVD_PIPE
        if _SVD_PIPE is None:
            import torch as _torch
            device = 'cuda' if (not CPU_ONLY and _torch.cuda.is_available()) else 'cpu'
            dtype = _torch.float16 if device == 'cuda' else _torch.float32
            _SVD_PIPE = StableVideoDiffusionPipeline.from_pretrained(
                'stabilityai/stable-video-diffusion-img2vid-xt-1-1', torch_dtype=dtype
            ).to(device)
        for img in images:
            # Generate ~3s motion at ~7 fps -> ~21 frames
            base = Image.open(img).convert('RGB')
            result = _SVD_PIPE(
                image=base,
                num_frames=21,
                fps=7,
                motion_bucket_id=127,
                noise_aug_strength=0.02,
                num_inference_steps=25,
                decode_chunk_size=8,
                generator=None
            )
            frames = result.frames[0] if hasattr(result, 'frames') else result.images
            clip = ImageSequenceClip([np.array(f) for f in frames], fps=7).set_duration(per)
            clips.append(clip)
    else:
        clips = [ken_burns_clip(img, duration=per) for img in images]
    video = concatenate_videoclips(clips, method='compose')
    # Trim to match target duration
    if video.duration > target_duration:
        video = video.subclip(0, target_duration)
    audio = AudioFileClip(audio_path)
    audio = audio.subclip(0, min(audio.duration, target_duration))
    final = video.set_audio(audio)
    final.write_videofile(out_path, fps=24, codec='libx264', audio_codec='aac', bitrate='4000k')
    return out_path


def build_music_video(
    audio_path: str,
    genre: str,
    style: str,
    palette: str,
    seed: Optional[int] = None,
    work_dir: Optional[str] = None
) -> str:
    """
    Unified entry point: prefer SDXL image synthesis + (optional) SVD motion when available; otherwise
    fall back to a fast procedural visualizer that runs everywhere.
    """
    work_dir = work_dir or tempfile.mkdtemp(prefix='mvjob_')
    _ensure_dir(work_dir)

    # Environment toggles
    force_fallback = os.getenv('SOTA_FORCE_FALLBACK', '0') == '1'
    disable_sdxl = os.getenv('SOTA_DISABLE_SDXL', '0') == '1'

    # If SDXL isn't available or explicitly disabled, use the lightweight path
    use_sdxl = (not force_fallback) and (not disable_sdxl) and _HAS_TORCH and (StableDiffusionXLPipeline is not None)

    if not use_sdxl:
        return build_visualizer_video(audio_path, genre, style, palette, seed=seed, work_dir=work_dir)

    # SDXL path (CPU or GPU depending on environment)
    try:
        dur = analyze_audio(audio_path)
        prompts = build_prompts(genre, style, palette)
        img_dir = os.path.join(work_dir, 'images')
        images = generate_images_sdxl(prompts, img_dir, seed=seed)
        out_path = os.path.join(work_dir, 'output.mp4')
        build_video_from_images(images, audio_path, out_path, target_duration=dur)
        return out_path
    except Exception:
        # Any failure in the heavy path should degrade gracefully to the visualizer
        return build_visualizer_video(audio_path, genre, style, palette, seed=seed, work_dir=work_dir)

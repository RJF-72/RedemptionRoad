# SOTA Music Video Generator Backend (Open Source)

This backend turns your audio into a real music video using open-source models and tools. No placeholders: actual image synthesis is performed using SDXL.

Core pipeline:
- Text-to-image (SDXL) for scene keyframes (requires PyTorch)
- Optional: Stable Video Diffusion (SVD) for motion clips from keyframes (add model + GPU)
- Ken Burns motion fallback over generated frames (still real synthesis)
- Stitch scenes, align to audio, and export MP4 with audio using MoviePy/FFmpeg

## Quick start (Windows)

1) Install Python 3.10+ and FFmpeg and ensure both are on PATH.
2) Create and activate a virtual environment.
3) Install requirements.
4) Install PyTorch. GPU build strongly recommended; CPU will work but be very slow.
5) Run the server (CPU-optimized by default):

```bat
python -m venv .venv
.venv\Scripts\activate
pip install -r backend\requirements.txt
# Install CUDA build (recommended) or CPU build from pytorch.org
# Example (CUDA 12.1):
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
# Example (CPU only):
# pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
python backend\server.py

The pipeline is configured for CPU-only by default for broad compatibility. You can control this via an environment flag.

CPU-only (default):
```bash
set SOTA_CPU_ONLY=1
python backend\server.py
```

Optional GPU (if available) — not recommended on this machine:
```bash
set SOTA_CPU_ONLY=0
python backend\server.py
```

The API will listen on http://localhost:8000

## Endpoints
- GET /api/health -> { status: "ok" }
- POST /api/generate/start (multipart)
  - audio: audio file (mp3/wav/flac/m4a)
  - genre: pop|rock|hip-hop|electronic|country|jazz|classical|christian|blues|folk
  - style: cinematic|energetic|minimalist|artistic|vintage|futuristic|dramatic|playful
  - palette: warm|cool|monochrome|vibrant
  - seed: optional integer
  - returns: { job_id }
- GET /api/generate/status?job_id=...
- GET /api/generate/result?job_id=... (video/mp4)

## Models
- SDXL: stabilityai/stable-diffusion-xl-base-1.0 (downloads on first run).
- Optional SVD: stabilityai/stable-video-diffusion-img2vid-xt-1-1 (accept license on HF).

Note: PyTorch is mandatory. Without torch, generation will fail fast with a clear error. For SOTA quality and reasonable speed, install PyTorch with CUDA and the models above.

Notes:
- On CPU, the pipeline uses smaller frames and fewer steps for practical runtimes (maintains 16:9, ~768x432, ~18 steps).
- Stable Video Diffusion is disabled in CPU mode to avoid extreme runtimes. Ken Burns motion is used instead.

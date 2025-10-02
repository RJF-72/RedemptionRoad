import os
import uuid
import threading
from typing import Dict
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware

from video_pipeline import build_music_video

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

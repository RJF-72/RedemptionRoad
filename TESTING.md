# Testing and CPU-only Operation

This suite is optimized for CPU-only execution by default. Follow this guide to validate the audio workstation and the video back-end without GPUs.

## CPU-only Backend

- The backend forces CPU by default using the environment flag `SOTA_CPU_ONLY=1`.
- In CPU mode:
  - SDXL uses 16:9 frames at ~768x432 and ~18 steps per image for practical runtimes.
  - Stable Video Diffusion is disabled to avoid extreme CPU runtimes; a cinematic Ken Burns effect is used instead.

Windows (cmd.exe):

```cmd
set SOTA_CPU_ONLY=1
python backend\server.py
```

Optional GPU (if you have one; not required):

```cmd
set SOTA_CPU_ONLY=0
python backend\server.py
```

## Frontend Self-Test (Synth/DAW)

Open the synthesizer/workstation page (the page that loads `assets.js`), then:

- Click the floating "Run Self-Test" button at the bottom-right.
- Or append `?selftest=1` to the URL to auto-open and run the tests.

The self-test will:
- Initialize audio
- Activate instruments
- Play and stop a tone
- Trigger drum hits + a drum pattern
- Start/stop the AI Composer
- Start/stop DAW master recording (if MediaRecorder supported)
- Export project JSON and save song JSON

You can copy logs from the self-test panel.

## Window Test API

For advanced/manual checks, `window.CountryMusicWorkstationTestAPI` exposes helpers:

- initializeAudio()
- toggleInstrument(key)
- playNoteHz(hz), stopNoteHz(hz)
- playDrum(id), startDrums(pattern), stopDrums()
- startAI(), stopAI()
- startRecording(), stopRecording()
- exportProject(), saveSong()
- setKey('G'), setBPM(120), setInstruments([...])

Example in DevTools console:

```js
await window.CountryMusicWorkstationTestAPI.initializeAudio();
window.CountryMusicWorkstationTestAPI.playNoteHz(440);
setTimeout(() => window.CountryMusicWorkstationTestAPI.stopNoteHz(440), 400);
```

## Troubleshooting

- No sound: Click somewhere in the page first and press Play; browsers require user interaction before audio starts. If the AudioContext is suspended, use the Retry button in the error banner.
- Recording errors: Some browsers/platforms don’t support MediaRecorder for audio. The self-test panel and error banner will indicate this. You can still use all synthesis features without recording.
- Slow video generation: CPU mode uses optimized settings, but SDXL can still be slow. Expect several minutes for a short song. For faster prototyping, use a shorter audio clip.

## Preparing for GitHub

- Ensure no large model weights or caches are committed.
- Recommended .gitignore includes: Python caches, virtualenvs, node_modules (if present), and any local outputs.
- See below for a suggested `.gitignore`.

```
# Python
__pycache__/
*.pyc
.venv/
.env/

# Node
node_modules/

# Outputs / temp
outputs/
*.mp4
*.wav
*.webm
*.sota
*.json
.DS_Store
Thumbs.db
```

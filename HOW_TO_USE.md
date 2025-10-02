# How to Use SOTA Professional Suite

This guide walks you through the core tools end-to-end: composing, recording, voice enhancement, and video generation. It’s written for your live site (https://redemptionrd.shop) using the CPU-only backend and Netlify /api proxy.

Quick links
- Live site: https://redemptionrd.shop
- Music Video Generator: https://redemptionrd.shop/SOTA_Music_Video_Generator.html
- Marketing Video Creator: https://redemptionrd.shop/SOTA_Marketing_Video_Creator.html
- Script-to-Video: https://redemptionrd.shop/SOTA_Script_To_Video_Engine.html
- Synthesizer: https://redemptionrd.shop/synthesizer.html
- DAW (Titan7 concept): https://redemptionrd.shop/daw.html
- Voice (WarriorMic): https://redemptionrd.shop/voice.html

---

## 1) Compose with the Synthesizer
File: `synthesizer.html`

What you can do
- Play the on-screen keyboard or connect a MIDI controller
- Add lyrics in the built-in lyrics editor
- Experiment with oscillators, filters, envelopes, delay/reverb
- Export stems or a project JSON for the DAW

Steps
1. Open the page and press the keyboard to audition sounds.
2. Use the top controls to tweak Waveform, Filter cutoff/resonance, and FX sends.
3. Open the Lyrics panel; type verses/chorus and click Save to JSON to export.
4. Record a quick idea with the Record button; export your audio if desired.
5. Export Project to save a `.sota`/JSON file for importing into the DAW.

Tips
- Reduce resonance and lengthen attack for softer pads.
- Use the Analyser to visualize tone and avoid clipping.

---

## 2) Arrange in the DAW
File: `daw.html`

What you can do
- Import `.sota` or `.json` project from the Synth
- Name tracks, set volumes/pans, basic arrangement
- Export the project to share or re-import later

Steps
1. Click Import and select your `.sota`/JSON.
2. Rename tracks and adjust basic mix controls.
3. Save/Export to persist your session.

Tips
- Keep track count reasonable on CPU systems.
- Use labels so it’s easy to understand projects later.

---

## 3) Enhance vocals with WarriorMic
File: `voice.html`

What you can do
- Clean up and enhance vocals
- Preview different “mic styles”
- Record or upload a short voice sample

Steps
1. Allow microphone permission when prompted.
2. Select a target mic profile (e.g., warm/bright).
3. Record a short vocal take and monitor levels.
4. Export WAV for use in the DAW or video tools.

Tips
- Speak 6–12 inches from the mic; avoid plosives (use a pop filter if possible).

---

## 4) Generate a Music Video
File: `SOTA_Music_Video_Generator.html` (uses /api backend)

What you can do
- Upload an audio file (WAV/MP3)
- Enter prompts for style/visuals
- The app sends a job to /api/generate/start, polls /api/generate/status, and downloads an MP4 when done

Steps
1. Open Music Video Generator, choose an audio file.
2. Enter a visual prompt (e.g., “neon synthwave cityscapes, cinematic, fast cuts”).
3. Click Generate. The progress indicator will update while the backend runs.
4. When complete, the MP4 preview appears. Click Download to save it.

CPU notes
- On CPU-only, generation uses reduced steps/resolution to finish in a reasonable time.
- Complex prompts or long audio increase processing time—start small while testing.

Troubleshooting
- If generation stalls, check your network and try a shorter clip first.
- Make sure your browser isn’t blocking mixed content—site enforces HTTPS.

---

## 5) Create Marketing Videos
File: `SOTA_Marketing_Video_Creator.html` (uses /api backend)

What you can do
- Build short promo videos for socials
- Upload assets (logo, product shots) and set brand colors

Steps
1. Upload your brand assets and set colors/type.
2. Enter a concise message (e.g., “New single out now—stream everywhere”).
3. Click Generate; wait for the MP4 preview and then Download.

Tips
- Keep it under 30–60 seconds for most platforms.

---

## 6) Script to Video
File: `SOTA_Script_To_Video_Engine.html`

What you can do
- Draft a multi-scene script
- Generate a storyboard and preview (simulation now; wired for backend)

Steps
1. Paste or write a script.
2. Use the tool to break script into scenes.
3. Preview and export the plan; integrate voice/music as needed.

---

## Backend API (for power users)
- Base URL: same-origin `/api` (Netlify proxies to `https://api.redemptionrd.shop`).
- Endpoints (typical flow):
  - POST `/api/generate/start` → returns `{ job_id }`
  - GET `/api/generate/status?job_id=...` → returns `{ status, progress, eta }`
  - GET `/api/generate/result?job_id=...` → returns MP4 blob

Authentication
- None for demo; production could add tokens/keys.

CPU-only behavior
- The backend is configured to run on CPU with tuned settings (float32, reduced steps/resolution). See `backend/README.md` and `TESTING.md`.

---

## Performance & Security
- All pages and API calls use HTTPS; HTTP is auto-redirected.
- Content-Security-Policy blocks plaintext connections and upgrades insecure requests.
- Use shorter clips/prompts on CPU; scale up once you validate outputs.

---

## Common Issues
- “Microphone not allowed”: Re-enable mic access in browser permissions.
- “Generation slow”: Use shorter audio or simpler prompts; CPU-only is slower by design.
- “Download not working”: Check browser’s download permission or try another browser.

---

## Where to get help
- README sections for deployment/testing
- `backend/README.md` for server setup
- `TESTING.md` for CPU-only tips


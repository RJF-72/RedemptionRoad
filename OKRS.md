# OKRs (Q4 2025 – 2026)

This document tracks Objectives and measurable Key Results. Review cadence: monthly check-ins, quarterly retros.

---

## Q4 2025

Objective 1: Ship reliable CPU-only video generation
- KR1: 95% success rate for 60–120s clips at 540p by Dec 31
- KR2: p95 generation time <= 12 minutes on baseline CPU
- KR3: Add small (360p) and medium (540p) presets with ETA reporting

Objective 2: Harden security and eliminate mixed content
- KR1: A grade on Mozilla Observatory for redemptionrd.shop
- KR2: 0 mixed-content warnings across all pages
- KR3: CSP nonces for inline scripts on two flagship pages (Music Video, Marketing Video)

Objective 3: Users can self-serve via docs and demos
- KR1: Publish HOW_TO_USE.md and link from README (done)
- KR2: Add 3 short demo GIFs (Synth, Video Gen, Voice) to docs
- KR3: First-success guide completed by a new user in <10 minutes (usability test)

---

## Q1 2026

Objective 1: Improve generation performance
- KR1: Reduce p95 generation time by 20% vs Q4 baseline
- KR2: Reduce failed jobs by 50% via better retries/timeouts
- KR3: Add per-preset tuning (steps, keyframes, scheduler)

Objective 2: Expand content quality and presets
- KR1: 10+ brand kits and video style presets ready-to-use
- KR2: A/B preset quality validation with user survey (>= 4/5)
- KR3: Marketing video exports adopted by at least 5 active users

Objective 3: Audio enhancements
- KR1: Voice page adds noise gate, de-esser, and compressor presets
- KR2: Synth export normalized to target LUFS with limiter preset
- KR3: Add stems export and markers in DAW interop

---

## Q2 2026

Objective 1: Script-to-Video backend integration
- KR1: E2E 30–90s narrative pipeline >90% success
- KR2: Voiceover/music alignment with +/- 200ms accuracy
- KR3: Scene-based editing controls in UI

Objective 2: Durable jobs and storage
- KR1: Survive process restarts with no job loss
- KR2: Automatic cleanup of temp assets after 7 days
- KR3: Shareable preview links with expiring tokens

---

## Q3–Q4 2026

Objective 1: Reliability and SLOs
- KR1: 99.5% monthly success rate for generation jobs (rolling 30d)
- KR2: Alert on 1- and 6-hour error budget burn rates
- KR3: Postmortems for incidents > 30 minutes

Objective 2: Growth and content
- KR1: 5 new tutorials, 10 new presets by Q4
- KR2: >90% of first-run users complete a generator flow
- KR3: Average NPS >= 40 from user feedback

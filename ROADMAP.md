# Product Roadmap (Q4 2025 – 2026)

This roadmap outlines prioritized milestones to evolve the SOTA Professional Suite across product, backend, security, deployment, docs, and growth. Timelines are aggressive but achievable with CPU-only constraints.

Legend
- P0: Must-have, critical path
- P1: High priority, strong impact
- P2: Nice to have, opportunistic

---

## Q4 2025 (Now → Dec 2025)
Focus: Production hardening, docs, security, and reliable video generation on CPU.

Epics
1) Reliable CPU Video Generation (P0)
- Stabilize /api generation pipeline: robust job queue, resumable polling
- Add small/medium presets (360p/540p) with ETA reporting
- Graceful timeouts + user-facing error messages
- Acceptance: 95% success rate for 60–120s clips at 540p; p95 end-to-end <= 12 min on baseline CPU

2) Security & Encryption (P0)
- HTTPS/HSTS/H2 already enforced; add CSP nonces for inline scripts (phase 1)
- Content download signing (short-lived URLs) for result files (phase 1)
- Acceptance: Zero mixed-content warnings; security headers A rating on Observatory

3) Documentation & Demos (P0)
- HOW_TO_USE.md (done), add GIF/short demo per feature
- Minimal API docs page for /api/generate/* with examples
- Acceptance: Users can follow docs to a first success in <10 minutes

4) Observability & Supportability (P1)
- Add request/trace logging with correlation IDs (backend)
- Add a minimal health page + generation metrics JSON
- Acceptance: Can diagnose failures with a single log correlation id

5) Landing/Conversion (P1)
- Pricing clarity, CTAs, one-page demo flow
- Acceptance: Time-to-first-success <5 minutes for guided demo

---

## Q1 2026
Focus: Performance, presets, and content pipeline quality.

Epics
1) Performance Tuning on CPU (P0)
- Optimize SDXL steps, scheduler, and keyframe spacing per preset
- Async I/O for MoviePy assembly; parallel safe sections
- Acceptance: p95 generation time reduced 20–30% vs Q4 baselines

2) Preset Library & Brand Kits (P0)
- Reusable visual styles, color palettes, typography
- User-branded templates in Marketing Creator
- Acceptance: 10+ quality presets with consistent results

3) Audio Enhancements (P1)
- Improve Synth export quality, normalize loudness
- Voice page: noise gate, de-esser, compressor chain presets
- Acceptance: Clear audible improvement with A/B demo

4) Import/Export & Interop (P1)
- DAW: better .sota schema, stems + markers
- Acceptance: Round-trip edits remain intact across tools

---

## Q2 2026
Focus: Advanced features and scalability.

Epics
1) Script-to-Video Backend Integration (P0)
- Scene breakdown → storyboard keyframes → assembly
- Voiceover + music bed alignment
- Acceptance: E2E pipeline for 30–90s narratives with >90% success

2) Job Queue & Storage (P0)
- Durable job queue (e.g., Redis-like abstraction or file-queue on single-node)
- Temp storage lifecycle for generated assets; cleanup policies
- Acceptance: Survive process restarts without job loss; automated cleanup

3) Collaboration & Sharing (P2)
- Shareable preview links with expiring tokens
- Acceptance: Private preview link usable on mobile/desktop

---

## Q3 2026
Focus: Quality of life and ecosystem.

Epics
1) Template Marketplace (P1)
- Curated templates/presets with previews and one-click apply
- Acceptance: 20+ templates; browse/apply flow under 3 clicks

2) Advanced Audio Tools (P2)
- Basic mastering chain presets; LUFS targets
- Acceptance: Simple master export passes loudness target for streaming

3) Localization & Accessibility (P2)
- High-contrast mode; i18n scaffolding
- Acceptance: Contrast AA, language switcher plumbed for strings

---

## Q4 2026
Focus: Polishing, stability, and growth.

Epics
1) Reliability & Error Budgets (P0)
- SLOs for API latency/success; alerting on burn rates
- Acceptance: 99.5% monthly success rate for generation jobs

2) Growth & Content (P1)
- Tutorials, case studies, and preset packs
- Acceptance: 5 new tutorials; 10 new presets

---

## Risks & Mitigations
- CPU-only performance: Use lower resolutions/preset tuning; parallelize safe steps
- Browser permissions (mic/camera): Clear prompts, fallbacks, and docs
- Large media processing: Stream where possible; chunk I/O; cleanup temp files

## Dependencies
- Stable FastAPI environment for backend
- Netlify frontend and proxy in place (done)

## Success Metrics (Top-level)
- Time-to-first-success: <5 minutes guided; <10 minutes unguided
- p95 generation time at 540p: target <= 10 min by Q2 2026
- Generation success rate: >= 95% by Q1 2026; >= 99% by Q4 2026
- Docs task completion: >90% of first-run users complete a generator flow

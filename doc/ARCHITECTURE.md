# Architecture

## Overview

```
┌──────────────────────────── Browser (React SPA) ────────────────────────────┐
│                                                                             │
│  Scanner ──► MediaPipe Hand Landmarker (WASM, self-hosted)                  │
│     │            21 landmarks · handedness · 3D world landmarks             │
│     ▼                                                                       │
│  imageValidation  brightness · contrast · Laplacian blur · geometry checks  │
│     │                                                                       │
│     ▼                                                                       │
│  imageProcessing  affine warp → 512² canonical palm → OpenCV.js:            │
│     │             gray → CLAHE → bilateral → black-hat → Gaussian (+Canny)  │
│     ▼                                                                       │
│  palmAnalysis     corridor DP tracing → confidence → features               │
│     │             ▲ manual correction (PalmLineOverlay) re-measures lines   │
│     ▼                                                                       │
│  interpretationEngine  41 bilingual rules + element themes → 4 reports      │
│     │                                                                       │
│     ▼                                                                       │
│  storageService (IndexedDB adapter) ── users · scans · features ·           │
│                                        readings · feedback · events         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ optional, features only (no images)
                         ┌─────────────▼──────────────┐
                         │ /api/interpret (Vercel fn) │──► Claude (server key)
                         │   or FastAPI service       │
                         └────────────────────────────┘
```

## Key design decisions

* **Everything runs on-device.** MediaPipe WASM, the hand model and OpenCV.js are copied into `/public` at install time (`scripts/setup-assets.mjs`), so there are no runtime CDN dependencies and no image ever leaves the browser.
* **Heavy code is lazy.** Pages are code-split. MediaPipe loads only on the scanner, and OpenCV.js (~10 MB, cached) only on the analysis page.
* **Canonical palm frame.** One affine transform from three landmarks normalises scale, rotation *and* handedness (via reflection), so the four line corridors can be defined once for every hand.
* **Honest confidence.** Line confidence comes from measured crease contrast and continuity. Weak or unclear lines are drawn dashed and labelled; the user can correct them, and corrections are re-measured, never assumed perfect.
* **Detection ≠ interpretation.** The UI, data model and reports keep *detected features* (with confidence) separate from *traditional interpretations*.
* **Deterministic readings.** Reports are regenerated from stored features with a per-scan seed, so a saved reading renders identically in English or Khmer.
* **Replaceable storage.** A five-method adapter interface lets IndexedDB be swapped for MySQL (via a REST API) or Firebase.

## Line tracing in detail

For each line *L* with guide polyline *g* and half-width *w* (canonical units):

1. Resample *g* to N = 90 points, compute normals, and sample the crease map at M = 35 offsets in [−w, w] → grid S[i, j].
2. DP: `best[i][j] = S[i][j] − prior·(offset/w)² + max_{|d|≤2}(best[i−1][j+d] − λ|d|)`, then backtrack the best path.
3. Smooth the path strength and take the **maximum-sum segment** of (strength − (μ + 0.7σ)), which bridges short weak gaps; count weak runs ≥3 samples as *breaks*.
4. `confidence = 100 · clamp((z − 0.5)/2) · (0.35 + 0.65 · clamp(coverage/0.55))`, where z is the segment contrast in σ.
5. Order: heart → life → head → fate; each found line is suppressed (×0.15) in the working map before the next search.

Calibrated on three real palm photos (two left palms, one right); validated by unit tests on synthetic crease maps.

## Data model

See the table in the root README. Readings store both the English and Khmer report (`interpretation: { en, km }`). Images are stored only when `imageConsent` is true.

## Pages & routes

| Route | Page |
|---|---|
| `/` | Home (landing) |
| `/dashboard` | Dashboard |
| `/scan` | Scanner |
| `/analysis` | Palm analysis (current scan) |
| `/results/current`, `/results/:scanId` | Reading report |
| `/history` | History |
| `/profile`, `/settings` | Profile, Settings |
| `/admin`, `/admin/:section` | Admin: overview, users, scans, content, model, feedback, settings |

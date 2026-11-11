# PalmVision AI

**Discover the Story Written in Your Palm.** PalmVision AI scans a palm with the webcam (or an uploaded photo), detects the hand with **MediaPipe Hand Landmarker**, enhances visible creases with **OpenCV.js**, traces the four major palm lines, and turns the measured features into traditional palmistry readings: Personality, Love, Career and Fortune.

> ⚠️ **For entertainment only.** Palmistry is not scientifically proven to predict personality, relationships, health, wealth or the future. The app keeps two things apart: *visual detection confidence* (how clearly a crease was seen) and *traditional interpretation* (what palmistry convention says about it).

---

## Features

| Area | What works |
|---|---|
| Landing page | Hero with animated palm illustration, How it works, Features, Palmistry categories, Privacy, CTA, disclaimer |
| Dashboard | Welcome, stats (scans, readings, avg. detection confidence, stored images), recent readings, latest scan preview, category shortcuts, getting-started checklist |
| Hand scanner | Live webcam (`getUserMedia`) with permission/error handling, camera switching, live 21-point landmarks, 6 scanning states, capture/retake/confirm, optional auto-capture; upload of JPG/JPEG/PNG/WEBP with type, size and decode validation |
| Quality checks | Hand presence, multiple hands, hand cut off, hand size, open fingers, palm-vs-back orientation, left/right mismatch, rotation, brightness, contrast, blur (Laplacian variance). Blocking failures are rejected with an explanation and are never faked |
| Palm analysis | Original image with projected lines, canonical palm crop, grayscale, CLAHE-enhanced, crease map, Canny edges, before/after compare slider, zoom & pan, per-line toggle/select/description |
| Line detection | Landmark-guided search corridors + dynamic-programming tracing over a black-hat crease map, with an honest per-line visual confidence (contrast × continuity) |
| Manual correction | Drag control points, redraw a line, mark a line not visible, reset to auto. Corrected lines are re-measured against the crease map |
| Interpretation | Offline rule engine (41 bilingual rules + palm-shape "element" themes), deterministic per scan; optional Claude narrative through a server-side endpoint |
| Reports | Detected features, traditional interpretation, detailed explanation, observations, reflection questions, disclaimer, print/PDF, feedback |
| History | Search, filters (hand, status, date), sort, view, delete with confirmation, image-free vector previews |
| Profile & settings | Name/email/dominant hand, English/Khmer, dark/light, reduce motion, landmarks, auto-capture, AI toggle + connection test, image consent default, export JSON, delete images, clear history |
| Admin | Overview stats & charts, user management, all scans, reading-content (rule) management, model-performance monitoring, feedback, app settings (thresholds, upload limit, AI switch) |
| i18n | Full English and Khmer (ខ្មែរ) UI and readings, with Battambang font for Khmer |

## Tech stack

React 19 · Vite 8 · Tailwind CSS 4 · React Router 7 · Framer Motion · Lucide React · MediaPipe Tasks Vision · OpenCV.js 4.10 · Canvas API · IndexedDB · Vitest · *(optional)* Vercel Function + Anthropic SDK · *(optional)* Python FastAPI + OpenCV.

Three.js was deliberately **not** added: the hero uses an animated SVG, which looks the part at a fraction of the bundle size.

## Quick start

Requirements: **Node.js 20+** (tested with Node 26) and a modern browser (Chrome, Edge, Safari or Firefox).

```bash
npm install          # also copies MediaPipe WASM + OpenCV.js into /public and downloads the hand model
npm run dev          # http://localhost:5173
npm test             # unit tests (i18n parity, CV tracer, rule engine, storage)
npm run build        # production build → dist/
npm run preview      # serve the production build locally
```

The camera needs a **secure context**: `localhost` works in development, and production must be served over HTTPS (Vercel does this automatically).

If `npm install` cannot download the model (e.g. offline), fetch
`https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`
into `public/models/hand_landmarker.task` and run `npm run setup:assets`.

## How the computer vision works

1. **Hand landmarks**: MediaPipe Hand Landmarker (self-hosted WASM + model) returns 21 landmarks, handedness and 3D world landmarks.
2. **Validation**: brightness, contrast and Laplacian-variance sharpness are measured on the hand region; geometry checks catch cut-off, small, closed, rotated or back-facing hands.
3. **Palm extraction**: an affine transform from three landmarks (index MCP, pinky MCP, wrist) warps the palm into an upright 512×512 *canonical* frame. A reflection is allowed, so the thumb is always on the left for both hands. A landmark-based polygon masks out background.
4. **Preprocessing (OpenCV.js)**: grayscale → CLAHE → bilateral filter → morphological **black-hat** (19 px ellipse) → Gaussian blur, plus a Canny edge view. If OpenCV.js fails to load, a pure-JS fallback runs instead and the UI says so.
5. **Line tracing**: each line has a search corridor in the canonical frame. A dynamic-programming tracer finds the smoothest high-response path; a maximum-sum segment picks the visible stretch and counts breaks. Lines are traced in the order heart → life → head → fate, and each found line is suppressed so overlapping corridors don't snap onto it.
6. **Confidence**: contrast of the path against its corridor (in σ) multiplied by coverage → 0–100 "visual confidence". Below threshold the line is shown dashed as *Weak/Unclear* and the user is invited to correct it.
7. **Features**: length, curvature, slope, end position, origin, breaks, head/life junction, plus palm shape (palm and finger ratios from 3D world landmarks) mapped to the four traditional "elements".

> Hand-landmark models do not detect palm creases. The line tracer is a classical heuristic, not a trained model. It works best with sharp, evenly lit photos, and the manual correction tool exists because it will sometimes be wrong. See `server/models/README.md` for the U-Net roadmap.

## Data model & privacy

Storage goes through an adapter (`src/services/storageService.js`), with IndexedDB by default and an in-memory fallback.

| Store | Fields |
|---|---|
| `users` | id, name, email, role, dominantHand, createdAt |
| `scans` | id, userId, handType, imageReference (only with consent), scanDate, detectionStatus, qualityScore, engine, lines, polygon, seed, narratives |
| `features` | id, scanId, lifeLine, headLine, heartLine, fateLine, palmShape, detectionConfidence, raw |
| `readings` | id, scanId, category, title, interpretation `{en, km}`, createdAt |
| `feedback` | id, userId, readingId, scanId, rating, comment, createdAt |
| `events` | analytics for the admin monitor (detection outcomes, timings, confidences) |

* Images are processed on-device and **never uploaded**. A reading is saved *without* the image unless the user ticks the consent box.
* Users can export everything as JSON, delete stored images, or clear the history.
* **MySQL / Firebase**: implement `{ getAll, get, put, delete, clear }` against your backend and call `setStorageAdapter(myAdapter)` at startup. The rest of the app is unchanged.

## Optional AI narrative (LLM)

The rule engine works offline and needs no API key. To add more natural prose:

* **Vercel**: set `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`, default `claude-opus-5-5`) in *Project → Settings → Environment Variables*. `api/interpret.js` is deployed automatically. Then enable *Settings → AI narrative* in the app.
* The endpoint receives only structured features and rule texts, **never images**. The system prompt forbids inventing features and making real predictions, and asks for low effort with JSON-schema output. Refusals use Anthropic's server-side `fallbacks: "default"`.
* Without a key, `GET /api/interpret` reports `configured: false` and the app stays fully functional.

## Deploying to Vercel

1. Push the project to GitHub/GitLab and import it in Vercel. The framework is detected as **Vite**.
2. The defaults from `vercel.json` apply: build command `npm run build`, output directory `dist`, SPA rewrites (every non-`/api` route → `index.html`), security headers, and long-term caching for `/mediapipe`, `/models` and `/vendor`.
3. *(Optional)* Add `ANTHROPIC_API_KEY` for the AI narrative.
4. Deploy. Vercel serves over HTTPS, so the camera works.

CLI alternative: `npm i -g vercel && vercel --prod`.

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_AI_API_BASE` | build-time (public) | Base URL of a separately hosted FastAPI service. Leave empty to use `/api/interpret` |
| `ANTHROPIC_API_KEY` | server only | Enables the AI narrative. Never prefix it with `VITE_` |
| `ANTHROPIC_MODEL` | server only | Model override (default `claude-opus-5-5`) |

### Optional Python service (FastAPI)

`server/` contains a FastAPI app with `/health`, `POST /api/enhance` (OpenCV crease enhancement) and `/api/interpret`. Vercel's standard frontend deployment does **not** run a persistent Python server, so host it separately (Render, Railway, Fly.io, Cloud Run, or the included `Dockerfile`):

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # set ALLOWED_ORIGINS / ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
pytest -q                       # 4 tests
```

Then build the frontend with `VITE_AI_API_BASE=https://your-service.example.com`.

## Project structure

```
api/interpret.js            Vercel function (optional LLM narrative)
server/                     Optional FastAPI + OpenCV service, Dockerfile, U-Net roadmap
scripts/setup-assets.mjs    Copies MediaPipe WASM + OpenCV.js, downloads the hand model
doc/                        Project documentation and presentation (PPTX)
src/
  components/               Navbar, Sidebar, Footer, CameraScanner, ImageUploader, HandLandmarks,
                            PalmLineOverlay, AnalysisCard, ReadingCard, LoadingAnimation, Modal,
                            StatusBadge, ConfidenceMeter, ImageCompare, MiniCharts, HeroPalm, …
  pages/                    Home, Dashboard, Scanner, PalmAnalysis, ReadingResults, History,
                            Profile, Settings, AdminDashboard, NotFound
  services/                 handDetection, imageProcessing, palmAnalysis, interpretationEngine, storageService
  hooks/                    useCamera, useHandLandmarker, useStore
  utils/                    palmRules, imageValidation, curves, dateHelpers
  data/readingData.js       Categories, line descriptions, labels, reflection questions, disclaimer
  i18n/                     en.js, km.js, useT()
  context/                  SettingsContext, ScanContext
  layouts/                  MainLayout, AdminLayout
```

## Testing

* `npm test`: 16 Vitest tests: EN/KM key parity and every used key exists, affine maths, the tracer finds a synthetic crease (<2% error) and reports low confidence on noise, the rule engine never fires rules for undetected lines, storage respects image consent and cascades deletes.
* `server/`: `pytest -q`: 4 tests for the Python service.
* Manual / E2E: verified in Chrome with real palm photos (upload → analysis → correction → reading → save → history → admin), a fake camera device, a non-hand image (correctly rejected), Khmer, light theme and a mobile viewport.

## Security notes

* No secrets in the frontend; the LLM key is read only by the server function.
* Uploads are type-, extension-, size- and decode-checked, and downscaled to ≤1600 px.
* Strict headers via `vercel.json` (HSTS, nosniff, referrer policy, camera-only permissions policy).
* The admin console is a **local demo**: it manages data in the current browser. A multi-user deployment must add server-side authentication and authorization before exposing admin features.

## Licence & credits

MediaPipe (Apache 2.0) · OpenCV (Apache 2.0) · Lucide (ISC) · Inter, Cormorant Garamond and Battambang fonts (OFL).

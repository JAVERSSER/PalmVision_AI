# Development report: phase by phase

Every phase was built, tested and fixed before moving on. Commands for all phases:

```bash
npm install && npm run dev     # develop at http://localhost:5173
npm test                       # unit tests
npm run build && npm run preview
```

## Phase 1: Setup, design system, landing page, dashboard, navigation
**Done:** Vite + React 19 + Tailwind 4 project; design tokens (navy/black, purple `#A78BFA`, gold `#D8B56D`, glass cards) with a light theme; Inter, Cormorant Garamond and Battambang fonts self-hosted; star-field background; animated SVG hero palm; landing page (hero, how it works, features, categories, privacy, CTA, disclaimer); navbar with mobile menu, sidebar, mobile tab bar, footer; dashboard; React Router with lazy-loaded pages.
**Files:** `package.json`, `vite.config.js`, `index.html`, `src/styles/index.css`, `src/main.jsx`, `src/App.jsx`, `src/layouts/*`, `src/components/{Navbar,Sidebar,Footer,Logo,StarField,HeroPalm,…}.jsx`, `src/pages/{Home,Dashboard}.jsx`.
**Issue fixed:** Tailwind 4 cannot `@apply` classes from `@layer components`, so they were converted to `@utility` definitions.

## Phase 2: Camera scanner, upload, MediaPipe
**Done:** `useCamera` (permission, error mapping, device switching, track cleanup), `useHandLandmarker` (live VIDEO-mode detection, stability tracking, fps), `CameraScanner`, `ImageUploader` (type/extension/size/decode validation), hand selection, 6-state stepper, review screen with real quality checks, retake/confirm.
**Files:** `src/services/handDetection.js`, `src/hooks/{useCamera,useHandLandmarker}.js`, `src/utils/imageValidation.js`, `src/components/{CameraScanner,ImageUploader,HandLandmarks,ScanStepper}.jsx`, `src/pages/Scanner.jsx`, `scripts/setup-assets.mjs`.
**Finding:** on un-mirrored palm photos MediaPipe's handedness label already matched the physical hand in every sample, so no flip is applied. Palm-vs-back is checked separately from landmark geometry.

## Phase 3: OpenCV processing and palm visualisation
**Done:** affine palm extraction, landmark-based palm mask, OpenCV.js pipeline (gray, CLAHE, bilateral, black-hat, Gaussian, Canny) with a JS fallback; analysis page with 6 views + compare slider, zoom/pan, line toggles and descriptions.
**Files:** `src/services/imageProcessing.js`, `src/components/{PalmLineOverlay,ImageCompare}.jsx`, `src/pages/PalmAnalysis.jsx`.
**Issue fixed:** the OpenCV.js 5.0 npm build failed to compile its WASM in Chrome, so the project is pinned to 4.10.

## Phase 4: Feature extraction and interpretation engine
**Done:** corridor DP line tracer with honest confidence; manual correction (drag, redraw, hide, reset) with re-measurement; feature extraction (length, curvature, slope, endpoints, origin, breaks, junction, palm-shape element); rule engine with 41 bilingual rules.
**Files:** `src/services/{palmAnalysis,interpretationEngine}.js`, `src/utils/{palmRules,curves}.js`, `src/data/readingData.js`.
**Tuning:** corridors calibrated on 3 real palms; switching from "longest run" to "maximum-sum segment" fixed life lines that were split at weak gaps.

## Phase 5: Reading reports and history
**Done:** report page (4 categories, palm image + relevant lines, detected features, interpretation, details, observations, reflections, disclaimer, print/PDF, feedback), save with explicit image consent, history with search/filters/sort/delete, image-free vector previews.
**Files:** `src/pages/{ReadingResults,History}.jsx`, `src/services/storageService.js`, `src/components/PalmSketch.jsx`.

## Phase 6: Profile, settings, admin, bilingual support
**Done:** profile (name, email validation, dominant hand), settings (language, theme, motion, landmarks, auto-capture, AI toggle + test, privacy/export/delete), admin (overview charts, users, scans, rule content editor, model-performance monitor, feedback, thresholds/upload/AI settings), full English + Khmer dictionaries, optional Claude narrative (Vercel function + FastAPI).
**Files:** `src/pages/{Profile,Settings,AdminDashboard}.jsx`, `src/components/MiniCharts.jsx`, `src/i18n/{en,km,index}.js`, `api/interpret.js`, `server/*`.

## Phase 7: Testing, optimisation, Vercel
**Done:** 16 Vitest tests + 4 pytest tests; production build; 23-step Playwright E2E against the production preview (zero console errors), covering a real palm upload, line correction, save and feedback, history, all admin sections, Khmer, light theme, mobile, the fake-camera path, a non-hand image rejection and SPA deep-link refresh; `vercel.json` (SPA rewrites, headers, caching), `.vercelignore`, README deployment guide.
**Issues fixed during testing:** an analysis-page grid overflow (`min-w-0`), a translucent mobile tab bar, Khmer glyphs broken by letter-spacing, and the AI connection test misreading the SPA fallback page.

### Known limitations
* Line detection is a classical heuristic. Expect occasional mistakes on low-light, blurry or heavily textured palms; the correction tool is the intended remedy.
* The admin console manages data in the local browser only, so multi-user production needs server-side auth.
* Khmer translations should be reviewed by a native speaker before publication.

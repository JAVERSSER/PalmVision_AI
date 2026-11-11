// Copies self-hosted computer-vision assets into /public so the app has no
// runtime CDN dependency. Runs automatically after `npm install`.
//
//   public/mediapipe/wasm/*          MediaPipe Tasks Vision WASM runtime
//   public/models/hand_landmarker.task  MediaPipe Hand Landmarker model (float16)
//   public/vendor/opencv.js          OpenCV.js (lazy-loaded only on the analysis page)
import { existsSync, mkdirSync, copyFileSync, readdirSync, writeFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function copyWasm() {
  const src = join(root, 'node_modules/@mediapipe/tasks-vision/wasm');
  const dest = join(pub, 'mediapipe/wasm');
  if (!existsSync(src)) return console.warn('[assets] @mediapipe/tasks-vision not installed yet — skipping WASM copy');
  ensureDir(dest);
  for (const file of readdirSync(src)) copyFileSync(join(src, file), join(dest, file));
  console.log('[assets] MediaPipe WASM copied');
}

function copyOpenCv() {
  const src = join(root, 'node_modules/@techstark/opencv-js/dist/opencv.js');
  const dest = join(pub, 'vendor/opencv.js');
  if (!existsSync(src)) return console.warn('[assets] @techstark/opencv-js not installed yet — skipping OpenCV copy');
  ensureDir(dirname(dest));
  copyFileSync(src, dest);
  console.log('[assets] OpenCV.js copied');
}

async function downloadModel() {
  const dest = join(pub, 'models/hand_landmarker.task');
  if (existsSync(dest) && statSync(dest).size > 1_000_000) return console.log('[assets] Hand model already present');
  ensureDir(dirname(dest));
  try {
    const res = await fetch(MODEL_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log('[assets] Hand Landmarker model downloaded');
  } catch (err) {
    console.warn(`[assets] Could not download hand model (${err.message}). Download it manually from\n  ${MODEL_URL}\n  into public/models/hand_landmarker.task`);
  }
}

copyWasm();
copyOpenCv();
await downloadModel();

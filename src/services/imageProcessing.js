// Palm-region extraction and crease enhancement.
//
// 1. The palm is warped into a canonical, upright square using three
//    MediaPipe landmarks (index MCP, pinky MCP, wrist). The affine transform
//    may include a reflection, so the thumb is always on the LEFT of the
//    canonical image for both left and right hands.
// 2. OpenCV.js converts it to grayscale, applies CLAHE contrast enhancement,
//    bilateral noise reduction and a black-hat morphology filter, which
//    responds strongly to thin dark structures such as palm creases.
// 3. If OpenCV.js cannot be loaded a pure-JS fallback performs the same
//    steps in simplified form, and the UI says so.

export const CANON_SIZE = 512;

/** Where the three anchor landmarks land in the canonical palm (0–1 units). */
export const CANON_ANCHORS = {
  5: [0.25, 0.1], // index finger MCP
  17: [0.85, 0.15], // pinky MCP
  0: [0.54, 0.97], // wrist
};

// ---------------------------------------------------------------- OpenCV ---

let cvPromise = null;

/** Lazily injects /vendor/opencv.js (≈13 MB, cached) and resolves when ready. */
export function loadOpenCV(timeoutMs = 45000) {
  if (cvPromise) return cvPromise;
  cvPromise = new Promise((resolve, reject) => {
    const finish = async () => {
      try {
        let cv = window.cv;
        if (cv instanceof Promise) cv = await cv;
        else if (cv && !cv.Mat) {
          await new Promise((r) => {
            cv.onRuntimeInitialized = r;
          });
        }
        if (!cv?.Mat) throw new Error('OpenCV runtime missing');
        // Wrapped in an object: the Emscripten module is "thenable" and would
        // otherwise be unwrapped by the promise machinery.
        resolve({ cv });
      } catch (e) {
        reject(e);
      }
    };
    if (window.cv) return void finish();
    const script = document.createElement('script');
    script.src = '/vendor/opencv.js';
    script.async = true;
    const timer = setTimeout(() => reject(new Error('OpenCV load timeout')), timeoutMs);
    script.onload = () => {
      clearTimeout(timer);
      finish();
    };
    script.onerror = () => {
      clearTimeout(timer);
      reject(new Error('OpenCV failed to load'));
    };
    document.head.appendChild(script);
  }).catch((err) => {
    cvPromise = null;
    throw err;
  });
  return cvPromise;
}

// ------------------------------------------------------------- geometry ---

/** Solves the 2×3 affine matrix mapping three source points onto three targets. */
export function solveAffine(src, dst) {
  const [[x0, y0], [x1, y1], [x2, y2]] = src;
  const det = x0 * (y1 - y2) - y0 * (x1 - x2) + (x1 * y2 - x2 * y1);
  if (Math.abs(det) < 1e-9) throw new Error('Degenerate landmark geometry');
  const inv = [
    [(y1 - y2) / det, (y2 - y0) / det, (y0 - y1) / det],
    [(x2 - x1) / det, (x0 - x2) / det, (x1 - x0) / det],
    [(x1 * y2 - x2 * y1) / det, (x2 * y0 - x0 * y2) / det, (x0 * y1 - x1 * y0) / det],
  ];
  const solve = (v) => [
    inv[0][0] * v[0] + inv[0][1] * v[1] + inv[0][2] * v[2],
    inv[1][0] * v[0] + inv[1][1] * v[1] + inv[1][2] * v[2],
    inv[2][0] * v[0] + inv[2][1] * v[1] + inv[2][2] * v[2],
  ];
  const [a, b, c] = solve([dst[0][0], dst[1][0], dst[2][0]]);
  const [d, e, f] = solve([dst[0][1], dst[1][1], dst[2][1]]);
  return [a, b, c, d, e, f]; // x' = a·x + b·y + c ; y' = d·x + e·y + f
}

export function invertAffine([a, b, c, d, e, f]) {
  const det = a * e - b * d;
  return [e / det, -b / det, (b * f - c * e) / det, -d / det, a / det, (c * d - a * f) / det];
}

export function applyAffine(m, [x, y]) {
  return [m[0] * x + m[1] * y + m[2], m[3] * x + m[4] * y + m[5]];
}

/** Forward transform from image pixels to canonical pixels. */
export function palmTransform(landmarks, imgW, imgH, size = CANON_SIZE) {
  const ids = [5, 17, 0];
  const src = ids.map((i) => [landmarks[i].x * imgW, landmarks[i].y * imgH]);
  const dst = ids.map((i) => [CANON_ANCHORS[i][0] * size, CANON_ANCHORS[i][1] * size]);
  return solveAffine(src, dst);
}

function convexHull(points) {
  const pts = [...points].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of pts.reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

/** Palm outline in canonical 0–1 coordinates, derived from the landmarks. */
export function palmPolygon(canon) {
  const P = (i) => canon[i];
  const pts = [
    P(0),
    P(1),
    [P(2)[0], P(2)[1] + 0.04],
    [P(5)[0] - 0.02, P(5)[1] + 0.035],
    [P(9)[0], P(9)[1] + 0.035],
    [P(13)[0], P(13)[1] + 0.035],
    [P(17)[0] + 0.03, P(17)[1] + 0.035],
    [Math.min(0.99, P(17)[0] + 0.07), 0.5],
    [Math.min(0.97, P(17)[0] + 0.03), 0.86],
    [Math.max(0.01, P(1)[0] - 0.06), Math.min(0.9, P(1)[1] - 0.12)],
  ];
  return convexHull(pts.map(([x, y]) => [Math.min(1, Math.max(0, x)), Math.min(1, Math.max(0, y))]));
}

/**
 * Warps the palm into the canonical square.
 * @returns {{crop: HTMLCanvasElement, mask: Uint8Array, polygon: number[][], forward: number[], inverse: number[], canonLandmarks: number[][]}}
 */
export function extractPalmRegion(sourceCanvas, landmarks, size = CANON_SIZE) {
  const W = sourceCanvas.width;
  const H = sourceCanvas.height;
  const forward = palmTransform(landmarks, W, H, size);
  const inverse = invertAffine(forward);

  const crop = document.createElement('canvas');
  crop.width = size;
  crop.height = size;
  const ctx = crop.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingQuality = 'high';
  const [a, b, c, d, e, f] = forward;
  // Canvas setTransform(a, b, c, d, e, f) maps (x, y) → (a·x + c·y + e, b·x + d·y + f)
  ctx.setTransform(a, d, b, e, c, f);
  ctx.drawImage(sourceCanvas, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const canonLandmarks = landmarks.map((p) => {
    const [x, y] = applyAffine(forward, [p.x * W, p.y * H]);
    return [x / size, y / size];
  });
  const polygon = palmPolygon(canonLandmarks);

  const mcan = document.createElement('canvas');
  mcan.width = size;
  mcan.height = size;
  const mctx = mcan.getContext('2d', { willReadFrequently: true });
  mctx.fillStyle = '#fff';
  mctx.beginPath();
  polygon.forEach(([x, y], i) => (i ? mctx.lineTo(x * size, y * size) : mctx.moveTo(x * size, y * size)));
  mctx.closePath();
  mctx.fill();
  const mdata = mctx.getImageData(0, 0, size, size).data;
  const mask = new Uint8Array(size * size);
  for (let i = 0; i < mask.length; i++) mask[i] = mdata[i * 4] > 127 ? 255 : 0;

  return { crop, mask, polygon, forward, inverse, canonLandmarks };
}

// ------------------------------------------------------------ processing ---

function canvasFromGray(gray, size, colorize = false) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < gray.length; i++) {
    const v = gray[i];
    const o = i * 4;
    if (colorize) {
      // violet→gold heat ramp for the crease map
      const t = v / 255;
      img.data[o] = Math.round(12 + 230 * Math.min(1, t * 1.4));
      img.data[o + 1] = Math.round(10 + 190 * Math.max(0, t - 0.35) * 1.5);
      img.data[o + 2] = Math.round(30 + 200 * Math.min(1, t * 2) * (1 - t * 0.6));
    } else {
      img.data[o] = img.data[o + 1] = img.data[o + 2] = v;
    }
    img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Shrinks the palm mask so shadows along the palm outline are not mistaken for creases. */
function erodeMask(mask, size, r = 7) {
  const f = Float32Array.from(mask);
  return Uint8Array.from(rankFilter(f, size, r, false));
}

/** Normalises a crease response to 0–1 using the 99th percentile inside the (eroded) mask. */
function normaliseCrease(raw, fullMask, size = CANON_SIZE) {
  const mask = erodeMask(fullMask, size);
  const vals = [];
  for (let i = 0; i < raw.length; i += 3) if (mask[i]) vals.push(raw[i]);
  vals.sort((a, b) => a - b);
  const hi = vals[Math.floor(vals.length * 0.99)] || 1;
  const out = new Float32Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = mask[i] ? Math.min(1, raw[i] / hi) : 0;
  return out;
}

function processWithOpenCV(cv, crop, mask, size) {
  const mats = [];
  const track = (m) => (mats.push(m), m);
  try {
    const src = track(cv.imread(crop));
    const gray = track(new cv.Mat());
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    const maskMat = track(cv.matFromArray(size, size, cv.CV_8UC1, Array.from(mask)));
    const inv = track(new cv.Mat());
    cv.bitwise_not(maskMat, inv);
    const mean = cv.mean(gray, maskMat)[0];
    gray.setTo(new cv.Scalar(mean), inv);

    const enhanced = track(new cv.Mat());
    let usedClahe = false;
    if (typeof cv.CLAHE === 'function') {
      const clahe = new cv.CLAHE(2.5, new cv.Size(8, 8));
      clahe.apply(gray, enhanced);
      clahe.delete();
      usedClahe = true;
    } else {
      cv.equalizeHist(gray, enhanced);
    }

    const denoised = track(new cv.Mat());
    cv.bilateralFilter(enhanced, denoised, 7, 45, 7, cv.BORDER_DEFAULT);

    // Black-hat = closing − image: bright where thin dark creases are.
    const kernel = track(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(19, 19)));
    const blackhat = track(new cv.Mat());
    cv.morphologyEx(denoised, blackhat, cv.MORPH_BLACKHAT, kernel);
    const smooth = track(new cv.Mat());
    cv.GaussianBlur(blackhat, smooth, new cv.Size(7, 7), 0);

    const edges = track(new cv.Mat());
    cv.Canny(denoised, edges, 30, 90);
    edges.setTo(new cv.Scalar(0), inv);

    const crease = normaliseCrease(Float32Array.from(smooth.data), mask);
    const creaseView = new Uint8Array(crease.length);
    for (let i = 0; i < crease.length; i++) creaseView[i] = Math.round(crease[i] * 255);

    const toCanvas = (mat) => {
      const c = document.createElement('canvas');
      cv.imshow(c, mat);
      return c;
    };
    return {
      engine: 'opencv',
      steps: usedClahe ? ['gray', 'clahe', 'bilateral', 'blackhat', 'gaussian', 'canny'] : ['gray', 'equalizeHist', 'bilateral', 'blackhat', 'gaussian', 'canny'],
      gray: toCanvas(gray),
      enhanced: toCanvas(denoised),
      crease: canvasFromGray(creaseView, size, true),
      edges: toCanvas(edges),
      creaseMap: crease,
    };
  } finally {
    mats.forEach((m) => m.delete());
  }
}

// Separable sliding max/min filter (square structuring element).
function rankFilter(src, size, r, useMax) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const pick = useMax ? Math.max : Math.min;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = src[y * size + x];
      for (let k = Math.max(0, x - r); k <= Math.min(size - 1, x + r); k++) v = pick(v, src[y * size + k]);
      tmp[y * size + x] = v;
    }
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = tmp[y * size + x];
      for (let k = Math.max(0, y - r); k <= Math.min(size - 1, y + r); k++) v = pick(v, tmp[k * size + x]);
      out[y * size + x] = v;
    }
  }
  return out;
}

function boxBlur(src, size, r) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  const n = 2 * r + 1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += src[y * size + Math.min(size - 1, Math.max(0, x + k))];
      tmp[y * size + x] = s / n;
    }
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let s = 0;
      for (let k = -r; k <= r; k++) s += tmp[Math.min(size - 1, Math.max(0, y + k)) * size + x];
      out[y * size + x] = s / n;
    }
  }
  return out;
}

function processWithJs(crop, mask, size) {
  const { data } = crop.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, size, size);
  const gray = new Float32Array(size * size);
  let sum = 0, n = 0;
  for (let i = 0; i < gray.length; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
    if (mask[i]) (sum += gray[i]), n++;
  }
  const mean = sum / Math.max(1, n);
  for (let i = 0; i < gray.length; i++) if (!mask[i]) gray[i] = mean;

  // Percentile contrast stretch (stand-in for CLAHE)
  const vals = Array.from(gray.filter((_, i) => mask[i] && i % 5 === 0)).sort((a, b) => a - b);
  const lo = vals[Math.floor(vals.length * 0.02)] ?? 0;
  const hi = vals[Math.floor(vals.length * 0.98)] ?? 255;
  const stretched = gray.map((v) => Math.max(0, Math.min(255, ((v - lo) / Math.max(1, hi - lo)) * 255)));
  const denoised = boxBlur(stretched, size, 1);
  const closed = rankFilter(rankFilter(denoised, size, 9, true), size, 9, false);
  const blackhat = closed.map((v, i) => Math.max(0, v - denoised[i]));
  const smooth = boxBlur(blackhat, size, 3);
  const crease = normaliseCrease(smooth, mask);

  const u8 = (arr) => Uint8Array.from(arr, (v) => Math.round(v));
  const creaseView = Uint8Array.from(crease, (v) => Math.round(v * 255));
  return {
    engine: 'javascript',
    steps: ['gray', 'contrastStretch', 'boxBlur', 'blackhat', 'boxBlur'],
    gray: canvasFromGray(u8(gray), size),
    enhanced: canvasFromGray(u8(denoised), size),
    crease: canvasFromGray(creaseView, size, true),
    edges: null,
    creaseMap: crease,
  };
}

/**
 * Runs the preprocessing pipeline on a canonical palm crop.
 * @returns {Promise<{engine, steps, gray, enhanced, crease, edges, creaseMap: Float32Array, durationMs, fallbackReason?}>}
 */
export async function processPalm(crop, mask, size = CANON_SIZE) {
  const t0 = performance.now();
  try {
    const { cv } = await loadOpenCV();
    const out = processWithOpenCV(cv, crop, mask, size);
    return { ...out, durationMs: performance.now() - t0 };
  } catch (err) {
    console.warn('[imageProcessing] OpenCV unavailable, using JS fallback', err);
    const out = processWithJs(crop, mask, size);
    return { ...out, durationMs: performance.now() - t0, fallbackReason: String(err?.message || err) };
  }
}

/** Small JPEG thumbnail used for history previews (only stored with consent). */
export function canvasToDataUrl(canvas, maxDim = 512, quality = 0.82) {
  const scale = Math.min(1, maxDim / Math.max(canvas.width, canvas.height));
  if (scale === 1) return canvas.toDataURL('image/jpeg', quality);
  const c = document.createElement('canvas');
  c.width = Math.round(canvas.width * scale);
  c.height = Math.round(canvas.height * scale);
  c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', quality);
}

// Image & hand-quality validation. Every check here is computed from real
// pixel data or real landmark geometry — nothing is simulated.

export const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const DEFAULT_MAX_UPLOAD_MB = 10;
export const MAX_DIMENSION = 1600; // images are downscaled to this before processing

export const DEFAULT_THRESHOLDS = {
  minBrightness: 55,
  maxBrightness: 215,
  minContrast: 22,
  minSharpness: 18, // variance of the Laplacian on the downscaled hand crop
  minHandArea: 0.06, // fraction of the frame covered by the hand bounding box
  minHandScore: 0.6,
};

/** Validates an uploaded file before it is decoded. */
export function validateFile(file, maxMb = DEFAULT_MAX_UPLOAD_MB) {
  if (!file) return { ok: false, error: 'upload.errors.noFile' };
  const type = (file.type || '').toLowerCase();
  const ext = (file.name || '').toLowerCase().split('.').pop();
  const extOk = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
  if (!ACCEPTED_TYPES.includes(type) || !extOk) return { ok: false, error: 'upload.errors.type' };
  if (file.size > maxMb * 1024 * 1024) return { ok: false, error: 'upload.errors.size', vars: { max: maxMb } };
  if (file.size < 1024) return { ok: false, error: 'upload.errors.empty' };
  return { ok: true };
}

/**
 * Decodes a validated file into a canvas (downscaled to MAX_DIMENSION).
 * Decoding through createImageBitmap/Image also rejects files whose bytes
 * are not really an image, regardless of the extension.
 */
export async function fileToCanvas(file) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error('upload.errors.decode');
  }
  const canvas = drawScaled(bitmap, bitmap.width, bitmap.height);
  bitmap.close?.();
  return canvas;
}

export function drawScaled(source, w, h, maxDim = MAX_DIMENSION, mirror = false) {
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function landmarkBBox(landmarks) {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const p of landmarks) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

/**
 * Brightness, contrast and sharpness of the hand region.
 * Sharpness = variance of a 4-neighbour Laplacian on a ≤256px grayscale crop.
 */
export function computeRegionStats(canvas, bbox) {
  const W = canvas.width;
  const H = canvas.height;
  const pad = 0.04;
  const x0 = Math.max(0, Math.floor((bbox.minX - pad) * W));
  const y0 = Math.max(0, Math.floor((bbox.minY - pad) * H));
  const x1 = Math.min(W, Math.ceil((bbox.maxX + pad) * W));
  const y1 = Math.min(H, Math.ceil((bbox.maxY + pad) * H));
  const cw = Math.max(1, x1 - x0);
  const ch = Math.max(1, y1 - y0);
  const scale = Math.min(1, 256 / Math.max(cw, ch));
  const tw = Math.max(8, Math.round(cw * scale));
  const th = Math.max(8, Math.round(ch * scale));
  const tmp = document.createElement('canvas');
  tmp.width = tw;
  tmp.height = th;
  const tctx = tmp.getContext('2d', { willReadFrequently: true });
  tctx.drawImage(canvas, x0, y0, cw, ch, 0, 0, tw, th);
  const { data } = tctx.getImageData(0, 0, tw, th);
  return statsFromRGBA(data, tw, th);
}

export function statsFromRGBA(data, w, h) {
  const gray = new Float32Array(w * h);
  let sum = 0;
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray[j] = g;
    sum += g;
  }
  const mean = sum / gray.length;
  let varSum = 0;
  for (let j = 0; j < gray.length; j++) varSum += (gray[j] - mean) ** 2;
  const contrast = Math.sqrt(varSum / gray.length);

  let lapSum = 0, lapSq = 0, n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap = gray[i - 1] + gray[i + 1] + gray[i - w] + gray[i + w] - 4 * gray[i];
      lapSum += lap;
      lapSq += lap * lap;
      n++;
    }
  }
  const lapMean = lapSum / Math.max(1, n);
  const sharpness = lapSq / Math.max(1, n) - lapMean * lapMean;
  return { brightness: mean, contrast, sharpness };
}

/** z-component of the 2D cross product (wrist→index MCP) × (wrist→pinky MCP). */
export function palmChirality(landmarks) {
  const w = landmarks[0], a = landmarks[5], b = landmarks[17];
  return (a.x - w.x) * (b.y - w.y) - (a.y - w.y) * (b.x - w.x);
}

/**
 * Whether the palm (not the back of the hand) faces the camera, for an
 * un-mirrored image. For a right hand seen palm-on the thumb appears on the
 * image's right, giving a negative cross product; a left palm is the mirror.
 */
export function isPalmFacing(landmarks, hand) {
  const c = palmChirality(landmarks);
  return hand === 'right' ? c < 0 : c > 0;
}

/** In-plane rotation of the hand (wrist → middle-finger MCP), degrees, 0 = fingers up. */
export function handRotation(landmarks) {
  const w = landmarks[0], m = landmarks[9];
  return (Math.atan2(m.x - w.x, -(m.y - w.y)) * 180) / Math.PI;
}

/** Fingers are extended when each fingertip is farther from the wrist than its PIP joint. */
export function fingersExtended(landmarks) {
  const d = (i) => Math.hypot(landmarks[i].x - landmarks[0].x, landmarks[i].y - landmarks[0].y);
  const pairs = [[8, 6], [12, 10], [16, 14], [20, 18]];
  return pairs.filter(([tip, pip]) => d(tip) > d(pip) * 1.05).length;
}

/**
 * Runs all quality checks.
 * @returns {{checks: Array<{id, status: 'pass'|'warn'|'fail', key, vars?}>, blocking: boolean, score: number}}
 */
export function assessQuality({ detection, hand, selectedHand, stats, thresholds = DEFAULT_THRESHOLDS }) {
  const checks = [];
  const add = (id, status, key, vars) => checks.push({ id, status, key, vars });

  if (!hand) {
    add('presence', 'fail', 'quality.noHand');
    return { checks, blocking: true, score: 0 };
  }
  add('presence', 'pass', 'quality.handFound', { score: Math.round(hand.handednessScore * 100) });

  if (detection.hands.length > 1) add('single', 'warn', 'quality.multipleHands');

  const box = landmarkBBox(hand.landmarks);
  const area = box.w * box.h;
  const margin = 0.01;
  const inFrame = box.minX > margin && box.minY > margin && box.maxX < 1 - margin && box.maxY < 1 - margin;
  if (!inFrame) add('frame', 'fail', 'quality.cutOff');
  else add('frame', 'pass', 'quality.inFrame');

  if (area < thresholds.minHandArea * 0.5) add('size', 'fail', 'quality.tooSmall');
  else if (area < thresholds.minHandArea) add('size', 'warn', 'quality.small');
  else add('size', 'pass', 'quality.sizeOk');

  const extended = fingersExtended(hand.landmarks);
  if (extended < 3) add('open', 'fail', 'quality.notOpen');
  else add('open', 'pass', 'quality.open');

  const facing = isPalmFacing(hand.landmarks, selectedHand);
  if (!facing) add('facing', 'warn', 'quality.backOrWrongHand');
  else add('facing', 'pass', 'quality.palmFacing');

  if (hand.handedness !== 'unknown' && hand.handedness !== selectedHand && hand.handednessScore > 0.8) {
    add('handMatch', 'warn', 'quality.handMismatch', { detected: hand.handedness });
  }

  const rot = handRotation(hand.landmarks);
  if (Math.abs(rot) > 60) add('rotation', 'warn', 'quality.rotated', { deg: Math.round(rot) });

  if (stats) {
    if (stats.brightness < thresholds.minBrightness) add('light', 'warn', 'quality.tooDark');
    else if (stats.brightness > thresholds.maxBrightness) add('light', 'warn', 'quality.tooBright');
    else add('light', 'pass', 'quality.lightOk');

    if (stats.contrast < thresholds.minContrast) add('contrast', 'warn', 'quality.lowContrast');

    if (stats.sharpness < thresholds.minSharpness * 0.45) add('blur', 'fail', 'quality.veryBlurry');
    else if (stats.sharpness < thresholds.minSharpness) add('blur', 'warn', 'quality.blurry');
    else add('blur', 'pass', 'quality.sharp');
  }

  const blocking = checks.some((c) => c.status === 'fail');
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const score = blocking ? 0 : Math.max(0, Math.round(100 - warnCount * 15 - (1 - hand.handednessScore) * 30));
  return { checks, blocking, score };
}

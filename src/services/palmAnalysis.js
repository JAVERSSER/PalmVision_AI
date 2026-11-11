// Palm-line tracing and structured feature extraction.
//
// Each traditional line has a *search corridor* in the canonical palm (thumb
// on the left, fingers at the top). Inside the corridor a dynamic-programming
// tracer finds the smoothest path that follows the strongest crease response
// (similar to seam carving). The path is then scored against the corridor's
// own background statistics; that contrast — not the interpretation — is what
// the "visual confidence" numbers report.

import { catmullRom, polylineLength, resample, bendRatio, sampleMap, dist } from '../utils/curves.js';

export const LINE_IDS = ['life', 'head', 'heart', 'fate'];

export const LINE_COLORS = {
  life: '#22c55e',
  head: '#3b82f6',
  heart: '#ef4444',
  fate: '#d8b56d',
};

/** Search corridors (canonical 0–1 units) and their half-widths. */
export const LINE_GUIDES = {
  heart: { guide: [[0.95, 0.3], [0.78, 0.27], [0.6, 0.24], [0.44, 0.2]], width: 0.085 },
  life: { guide: [[0.27, 0.28], [0.36, 0.43], [0.44, 0.6], [0.49, 0.77], [0.5, 0.93]], width: 0.09 },
  head: { guide: [[0.22, 0.32], [0.42, 0.4], [0.62, 0.48], [0.8, 0.54]], width: 0.09 },
  fate: { guide: [[0.61, 0.93], [0.58, 0.72], [0.55, 0.5], [0.52, 0.3]], width: 0.07 },
};

const SAMPLES = 90;
const OFFSETS = 35;

function normals(points) {
  return points.map((p, i) => {
    const a = points[Math.max(0, i - 1)], b = points[Math.min(points.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return [-dy / len, dx / len];
  });
}

function movingAverage(arr, r) {
  return arr.map((_, i) => {
    let s = 0, n = 0;
    for (let k = Math.max(0, i - r); k <= Math.min(arr.length - 1, i + r); k++) (s += arr[k]), n++;
    return s / n;
  });
}

/**
 * Traces one line through the crease map.
 * @param {Float32Array} map  crease response 0–1, size × size
 */
export function traceLine(map, size, { guide, width }, opts = {}) {
  const N = opts.samples || SAMPLES;
  const M = opts.offsets || OFFSETS;
  const center = resample(guide, N);
  const nrm = normals(center);
  const offs = Array.from({ length: M }, (_, j) => -width + (2 * width * j) / (M - 1));

  // Score grid
  const grid = new Float32Array(N * M);
  let sum = 0, sq = 0;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const x = center[i][0] + nrm[i][0] * offs[j];
      const y = center[i][1] + nrm[i][1] * offs[j];
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      const v = inside ? sampleMap(map, size, x, y) : 0;
      grid[i * M + j] = v;
      sum += v;
      sq += v * v;
    }
  }
  const mu = sum / grid.length;
  const sigma = Math.sqrt(Math.max(1e-8, sq / grid.length - mu * mu));

  // Dynamic programming: maximise Σ strength − λ·|Δoffset| − prior·offset²
  const lambda = 0.035, prior = 0.02, maxStep = 2;
  const best = new Float32Array(N * M);
  const from = new Int16Array(N * M);
  for (let j = 0; j < M; j++) best[j] = grid[j] - prior * (offs[j] / width) ** 2;
  for (let i = 1; i < N; i++) {
    for (let j = 0; j < M; j++) {
      let bv = -Infinity, bj = j;
      for (let d = -maxStep; d <= maxStep; d++) {
        const k = j + d;
        if (k < 0 || k >= M) continue;
        const v = best[(i - 1) * M + k] - lambda * Math.abs(d);
        if (v > bv) (bv = v), (bj = k);
      }
      best[i * M + j] = bv + grid[i * M + j] - prior * (offs[j] / width) ** 2;
      from[i * M + j] = bj;
    }
  }
  let j = 0;
  for (let k = 1; k < M; k++) if (best[(N - 1) * M + k] > best[(N - 1) * M + j]) j = k;
  const idx = new Array(N);
  for (let i = N - 1; i >= 0; i--) {
    idx[i] = j;
    j = from[i * M + j];
  }
  const path = idx.map((jj, i) => [center[i][0] + nrm[i][0] * offs[jj], center[i][1] + nrm[i][1] * offs[jj]]);
  const strength = idx.map((jj, i) => grid[i * M + jj]);

  return summarisePath({ path, strength, mu, sigma, samples: N });
}

/** Finds the strongest continuous segment of a traced path and scores it. */
function summarisePath({ path, strength, mu, sigma, samples }) {
  const smooth = movingAverage(strength, 2);
  const thr = mu + 0.7 * sigma;

  // Maximum-sum segment of (strength − threshold) (Kadane). Unlike a plain
  // "longest run", this bridges short weak gaps when strong crease surrounds
  // them, which is how real creases look (they fade and resume).
  let bestSeg = null;
  let runSum = 0, runStart = 0, bestSum = 0;
  for (let i = 0; i < samples; i++) {
    const v = smooth[i] - thr;
    if (runSum <= 0) (runSum = v), (runStart = i);
    else runSum += v;
    if (runSum > bestSum) (bestSum = runSum), (bestSeg = { a: runStart, b: i });
  }
  if (bestSeg) {
    // Breaks = weak stretches (≥3 samples) inside the chosen segment.
    let breaks = 0, weak = 0;
    for (let i = bestSeg.a; i <= bestSeg.b; i++) {
      if (smooth[i] < thr) weak++;
      else {
        if (weak >= 3) breaks++;
        weak = 0;
      }
    }
    bestSeg.breaks = breaks;
  }

  const stats = { mu, sigma };
  if (!bestSeg || bestSeg.b - bestSeg.a < samples * 0.12) {
    // Nothing convincing: keep the strongest stretch for the user to inspect/correct.
    const a = Math.floor(samples * 0.2), b = Math.floor(samples * 0.8);
    const z = (avg(strength.slice(a, b + 1)) - mu) / sigma;
    return {
      points: simplify(path.slice(a, b + 1)),
      confidence: Math.min(15, scoreConfidence(z, (b - a + 1) / samples)),
      coverage: 0,
      breaks: 0,
      contrast: round2(z),
      status: 'none',
      stats,
    };
  }
  const { a, b, breaks } = bestSeg;
  const seg = strength.slice(a, b + 1);
  const z = (avg(seg) - mu) / sigma;
  const coverage = (b - a + 1) / samples;
  const confidence = scoreConfidence(z, coverage);
  return {
    points: simplify(path.slice(a, b + 1)),
    confidence,
    coverage: round2(coverage),
    breaks,
    contrast: round2(z),
    status: confidence >= 55 ? 'detected' : 'weak',
    stats,
  };
}

const avg = (arr) => arr.reduce((s, v) => s + v, 0) / Math.max(1, arr.length);
const round2 = (v) => Math.round(v * 100) / 100;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Heuristic visual confidence (0–100) from crease contrast and continuity. */
export function scoreConfidence(z, coverage) {
  return Math.round(100 * clamp01((z - 0.5) / 2.0) * (0.35 + 0.65 * clamp01(coverage / 0.55)));
}

/** Reduces a dense path to ~7 control points for display and manual editing. */
export function simplify(path, k = 7) {
  if (path.length <= k) return path.map((p) => [round4(p[0]), round4(p[1])]);
  const smoothX = movingAverage(path.map((p) => p[0]), 3);
  const smoothY = movingAverage(path.map((p) => p[1]), 3);
  const pts = smoothX.map((x, i) => [x, smoothY[i]]);
  return resample(pts, k).map((p) => [round4(p[0]), round4(p[1])]);
}
const round4 = (v) => Math.round(v * 10000) / 10000;

/** Suppresses crease response around a traced line so the next search ignores it. */
function suppress(map, size, points, radius = 0.025) {
  const dense = catmullRom(points, 16);
  const r = Math.ceil(radius * size);
  for (const [x, y] of dense) {
    const cx = Math.round(x * size), cy = Math.round(y * size);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const px = cx + dx, py = cy + dy;
        if (px < 0 || py < 0 || px >= size || py >= size || dx * dx + dy * dy > r * r) continue;
        map[py * size + px] *= 0.15;
      }
    }
  }
}

/**
 * Traces all four lines. Order matters: each found line is suppressed in the
 * working map so later searches (whose corridors overlap) cannot snap onto it.
 * Heart → Life → Head → Fate.
 */
export function detectPalmLines(creaseMap, size) {
  const t0 = performance.now();
  const work = Float32Array.from(creaseMap);
  const lines = {};
  for (const id of ['heart', 'life', 'head', 'fate']) {
    lines[id] = traceLine(work, size, LINE_GUIDES[id]);
    if (lines[id].status !== 'none') suppress(work, size, lines[id].points);
  }
  for (const id of LINE_IDS) {
    lines[id] = { id, source: 'auto', visible: lines[id].status !== 'none', ...lines[id] };
    lines[id].autoPoints = lines[id].points;
  }
  return { lines, durationMs: performance.now() - t0 };
}

/**
 * Measures crease contrast along an arbitrary (e.g. user-drawn) line using the
 * corridor statistics recorded during auto-detection.
 */
export function measureLine(map, size, points, stats) {
  if (!points || points.length < 2 || !stats) return { contrast: 0, confidence: 0 };
  const dense = resample(catmullRom(points, 12), 60);
  const vals = dense.map(([x, y]) => sampleMap(map, size, x, y));
  const z = (avg(vals) - stats.mu) / stats.sigma;
  return { contrast: round2(z), confidence: scoreConfidence(z, 0.6) };
}

// ------------------------------------------------------------ features ---

function visibilityFrom(line) {
  if (!line || !line.visible) return 'none';
  const c = line.confidence;
  if (c >= 70) return 'clear';
  if (c >= 45) return 'moderate';
  if (c >= 20) return 'faint';
  return 'faint';
}

function lengthClass(value, [short, long]) {
  if (value < short) return 'short';
  if (value > long) return 'long';
  return 'medium';
}

function bendClass(ratio, [slight, strong]) {
  if (ratio < slight) return 'straight';
  if (ratio > strong) return 'curved';
  return 'gentle';
}

/** Orders a line's points consistently (e.g. heart: pinky side → index side). */
function oriented(points, axis, ascending) {
  const first = points[0][axis], last = points[points.length - 1][axis];
  return (ascending ? first <= last : first >= last) ? points : [...points].reverse();
}

function lineGeometry(points) {
  const dense = catmullRom(points, 10);
  return { length: polylineLength(dense), bend: bendRatio(dense), dense };
}

/** Palm shape from 3D world landmarks (metres) when available, otherwise image space. */
export function palmShape(hand, imgW = 1, imgH = 1) {
  const useWorld = hand.worldLandmarks?.length === 21;
  const P = useWorld
    ? hand.worldLandmarks.map((p) => [p.x, p.y, p.z])
    : hand.landmarks.map((p) => [p.x * imgW, p.y * imgH, 0]);
  const d = (i, j) => Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1], P[i][2] - P[j][2]);
  const palmWidth = d(5, 17);
  const palmLength = d(0, 9);
  const fingerLength = d(9, 10) + d(10, 11) + d(11, 12);
  const palmRatio = palmLength / palmWidth;
  const fingerRatio = fingerLength / palmLength;
  const shape = palmRatio > 1.55 ? 'long' : 'square';
  const fingers = fingerRatio > 1.0 ? 'long' : 'short';
  const element = { 'square-short': 'earth', 'square-long': 'air', 'long-short': 'fire', 'long-long': 'water' }[`${shape}-${fingers}`];
  return { shape, fingers, element, palmRatio: round2(palmRatio), fingerRatio: round2(fingerRatio), source: useWorld ? 'world' : 'image' };
}

/**
 * Converts (possibly user-corrected) lines into structured, explainable features.
 * All thresholds are in canonical palm units (palm ≈ 0.6 wide, ≈ 0.87 tall).
 */
export function extractFeatures({ lines, hand, handType, canonLandmarks, quality, imageSize }) {
  const out = { handType, lines: {}, palmShape: palmShape(hand, imageSize?.w, imageSize?.h) };
  const c = canonLandmarks;

  for (const id of LINE_IDS) {
    const line = lines[id];
    const base = {
      visible: !!line?.visible,
      visibility: visibilityFrom(line),
      confidence: line?.visible ? line.confidence : 0,
      source: line?.source || 'auto',
      breaks: line?.visible ? line.breaks || 0 : 0,
    };
    if (!line?.visible) {
      out.lines[id] = { ...base, length: 'none' };
      continue;
    }
    const g = lineGeometry(line.points);
    if (id === 'heart') {
      const pts = oriented(line.points, 0, false); // pinky → index
      const end = pts[pts.length - 1];
      const endsAt = end[0] < c[5][0] + 0.04 ? 'index' : end[0] < (c[5][0] + c[9][0]) / 2 + 0.05 ? 'between' : 'middle';
      const rise = pts[0][1] - end[1];
      Object.assign(base, {
        length: lengthClass(g.length, [0.38, 0.55]),
        curvature: bendClass(g.bend, [0.06, 0.14]),
        endsAt,
        risesTowardFingers: rise > 0.05,
      });
    } else if (id === 'head') {
      const pts = oriented(line.points, 0, true); // thumb side → pinky side
      const angle = (Math.atan2(pts[pts.length - 1][1] - pts[0][1], pts[pts.length - 1][0] - pts[0][0]) * 180) / Math.PI;
      const life = lines.life?.visible ? oriented(lines.life.points, 1, true)[0] : null;
      Object.assign(base, {
        length: lengthClass(g.length, [0.36, 0.52]),
        slope: angle < 12 ? 'straight' : angle < 28 ? 'gentle' : 'steep',
        slopeDegrees: Math.round(angle),
        curvature: bendClass(g.bend, [0.05, 0.12]),
        joinedWithLife: life ? dist(pts[0], life) < 0.07 : false,
      });
    } else if (id === 'life') {
      const pts = oriented(line.points, 1, true); // top → wrist
      const bottom = pts[pts.length - 1][1];
      Object.assign(base, {
        length: bottom > 0.84 ? 'long' : bottom > 0.66 ? 'medium' : 'short',
        curvature: g.bend > 0.12 ? 'wide' : g.bend > 0.06 ? 'gentle' : 'close',
        reachesWrist: bottom > 0.84,
      });
    } else if (id === 'fate') {
      const pts = oriented(line.points, 1, false); // wrist → fingers
      const startY = pts[0][1];
      Object.assign(base, {
        length: lengthClass(g.length, [0.3, 0.5]),
        origin: startY > 0.82 ? 'wrist' : startY > 0.6 ? 'lower' : 'middle',
        endsNear: pts[pts.length - 1][1] < 0.3 ? 'fingers' : 'heartLine',
      });
    }
    out.lines[id] = base;
  }

  const main = ['life', 'head', 'heart'].map((id) => out.lines[id].confidence);
  const landmarkScore = Math.round((hand.handednessScore || 0) * 100);
  out.detectionConfidence = {
    landmarks: landmarkScore,
    quality: quality?.score ?? null,
    lines: Object.fromEntries(LINE_IDS.map((id) => [id, out.lines[id].confidence])),
    overall: Math.round(0.2 * landmarkScore + 0.15 * (quality?.score ?? 60) + 0.65 * avg(main)),
  };
  out.manuallyAdjusted = LINE_IDS.filter((id) => lines[id]?.source !== 'auto');
  return out;
}

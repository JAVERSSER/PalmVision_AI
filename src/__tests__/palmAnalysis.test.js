import { describe, it, expect } from 'vitest';
import { traceLine, detectPalmLines, extractFeatures, LINE_GUIDES, scoreConfidence } from '../services/palmAnalysis.js';
import { solveAffine, applyAffine, invertAffine } from '../services/imageProcessing.js';
import { resample, polylineLength, bendRatio } from '../utils/curves.js';

const S = 256;

function seededNoise(seed = 7) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
}

/** Crease map with mild noise and an optional bright stroke along `pts`. */
function makeMap(pts, strength = 1) {
  const rnd = seededNoise();
  const map = new Float32Array(S * S).map(() => rnd() * 0.25);
  if (pts) {
    for (const [x, y] of resample(pts, 400)) {
      const cx = Math.round(x * S), cy = Math.round(y * S);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) map[(cy + dy) * S + cx + dx] = strength;
    }
  }
  return map;
}

describe('geometry', () => {
  it('solves and inverts an affine transform exactly', () => {
    const src = [[10, 20], [200, 40], [90, 300]];
    const dst = [[0, 0], [100, 0], [50, 100]];
    const m = solveAffine(src, dst);
    src.forEach((p, i) => {
      const q = applyAffine(m, p);
      expect(q[0]).toBeCloseTo(dst[i][0], 6);
      expect(q[1]).toBeCloseTo(dst[i][1], 6);
    });
    const back = applyAffine(invertAffine(m), dst[2]);
    expect(back[0]).toBeCloseTo(90, 6);
    expect(back[1]).toBeCloseTo(300, 6);
  });

  it('resamples by arc length and measures bend', () => {
    const line = resample([[0, 0], [1, 0]], 11);
    expect(line).toHaveLength(11);
    expect(polylineLength(line)).toBeCloseTo(1, 6);
    expect(bendRatio(line)).toBeCloseTo(0, 6);
    expect(bendRatio([[0, 0], [0.5, 0.25], [1, 0]])).toBeCloseTo(0.25, 6);
  });
});

describe('line tracing', () => {
  it('finds a clear crease inside its corridor with high confidence', () => {
    const truth = [[0.94, 0.33], [0.7, 0.29], [0.5, 0.26], [0.44, 0.22]];
    const res = traceLine(makeMap(truth), S, LINE_GUIDES.heart);
    expect(res.status).toBe('detected');
    expect(res.confidence).toBeGreaterThan(70);
    // Every traced point should lie close to the true crease
    const dense = resample(truth, 200);
    for (const p of res.points) {
      const d = Math.min(...dense.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1])));
      expect(d).toBeLessThan(0.02);
    }
  });

  it('reports low confidence on pure noise instead of inventing a line', () => {
    const res = traceLine(makeMap(null), S, LINE_GUIDES.fate);
    expect(res.confidence).toBeLessThan(45);
    expect(res.status).not.toBe('detected');
  });

  it('confidence grows with contrast and coverage', () => {
    expect(scoreConfidence(3, 0.6)).toBeGreaterThan(scoreConfidence(1.5, 0.6));
    expect(scoreConfidence(2, 0.8)).toBeGreaterThan(scoreConfidence(2, 0.2));
    expect(scoreConfidence(0.2, 1)).toBe(0);
  });

  it('extracts structured features from detected lines', () => {
    const map = makeMap([[0.94, 0.3], [0.6, 0.25], [0.43, 0.2]]);
    const { lines } = detectPalmLines(map, S);
    const canon = Array.from({ length: 21 }, () => [0.5, 0.5]);
    canon[5] = [0.25, 0.1]; canon[9] = [0.45, 0.08]; canon[13] = [0.65, 0.1]; canon[17] = [0.85, 0.15];
    const lm = Array.from({ length: 21 }, (_, i) => ({ x: 0.3 + (i % 5) * 0.05, y: 0.2 + Math.floor(i / 5) * 0.12, z: 0 }));
    const f = extractFeatures({ lines, hand: { landmarks: lm, worldLandmarks: [], handednessScore: 0.9 }, handType: 'left', canonLandmarks: canon, quality: { score: 90 } });
    expect(f.lines.heart.visible).toBe(true);
    expect(['index', 'between', 'middle']).toContain(f.lines.heart.endsAt);
    expect(f.detectionConfidence.overall).toBeGreaterThan(0);
    expect(['earth', 'air', 'fire', 'water']).toContain(f.palmShape.element);
  });
});

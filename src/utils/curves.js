// Small geometry helpers for palm-line polylines (points are [x, y] in 0–1 units).

export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function polylineLength(points) {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += dist(points[i - 1], points[i]);
  return len;
}

/** Resamples a polyline to `n` points evenly spaced by arc length. */
export function resample(points, n) {
  if (points.length < 2) return points.slice();
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + dist(points[i - 1], points[i]));
  const total = cum[cum.length - 1] || 1;
  const out = [];
  let seg = 1;
  for (let k = 0; k < n; k++) {
    const t = (k / (n - 1)) * total;
    while (seg < cum.length - 1 && cum[seg] < t) seg++;
    const span = cum[seg] - cum[seg - 1] || 1;
    const u = Math.min(1, Math.max(0, (t - cum[seg - 1]) / span));
    const a = points[seg - 1], b = points[seg];
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return out;
}

/** Centripetal-ish Catmull-Rom spline through control points, `perSeg` samples per segment. */
export function catmullRom(points, perSeg = 12) {
  if (points.length < 3) return points.length === 2 ? resample(points, perSeg + 1) : points.slice();
  const p = [points[0], ...points, points[points.length - 1]];
  const out = [];
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    for (let s = 0; s < perSeg; s++) {
      const t = s / perSeg, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((k) =>
        0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3),
      ));
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

/** SVG path data for a smooth curve through the control points (coordinates scaled by `scale`). */
export function curvePath(points, scale = 1000) {
  const pts = catmullRom(points, 10);
  return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(x * scale).toFixed(1)} ${(y * scale).toFixed(1)}`).join(' ');
}

/** Maximum perpendicular distance from the chord divided by chord length (0 = straight). */
export function bendRatio(points) {
  const a = points[0], b = points[points.length - 1];
  const chord = dist(a, b) || 1e-6;
  let maxD = 0;
  for (const p of points) {
    const d = Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / chord;
    maxD = Math.max(maxD, d);
  }
  return maxD / chord;
}

/** Bilinear sample of a square float map (size × size) at 0–1 coordinates. */
export function sampleMap(map, size, x, y) {
  const fx = Math.min(size - 1.001, Math.max(0, x * size - 0.5));
  const fy = Math.min(size - 1.001, Math.max(0, y * size - 0.5));
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const dx = fx - x0, dy = fy - y0;
  const i = y0 * size + x0;
  return (
    map[i] * (1 - dx) * (1 - dy) +
    map[i + 1] * dx * (1 - dy) +
    map[i + size] * (1 - dx) * dy +
    map[i + size + 1] * dx * dy
  );
}

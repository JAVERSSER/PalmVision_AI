import { curvePath } from '../utils/curves.js';
import { LINE_COLORS, LINE_IDS } from '../services/palmAnalysis.js';

/**
 * Image-free preview of a scan: the palm outline and detected lines as vectors.
 * Used in history when the user did not consent to storing the palm image.
 */
export default function PalmSketch({ polygon, lines, className = 'h-full w-full' }) {
  const outline = polygon?.length ? `M${polygon.map(([x, y]) => `${x * 1000} ${y * 1000}`).join(' L')} Z` : null;
  return (
    <svg viewBox="0 0 1000 1000" className={className} aria-hidden="true">
      <rect width="1000" height="1000" fill="url(#ps-bg)" />
      <defs>
        <radialGradient id="ps-bg" cx="50%" cy="45%" r="70%">
          <stop offset="0" stopColor="#2a2350" />
          <stop offset="1" stopColor="#0e1024" />
        </radialGradient>
      </defs>
      {outline && <path d={outline} fill="rgba(167,139,250,.08)" stroke="rgba(167,139,250,.45)" strokeWidth="6" strokeDasharray="14 12" />}
      {LINE_IDS.map((id) => {
        const l = lines?.[id];
        if (!l?.points?.length || !l.visible) return null;
        return <path key={id} d={curvePath(l.points)} fill="none" stroke={LINE_COLORS[id]} strokeWidth="16" strokeLinecap="round" />;
      })}
    </svg>
  );
}

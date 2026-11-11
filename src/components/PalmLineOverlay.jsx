import { useRef, useState } from 'react';
import { curvePath } from '../utils/curves.js';
import { LINE_COLORS, LINE_IDS } from '../services/palmAnalysis.js';

/**
 * SVG overlay of the four palm lines on the canonical palm image.
 *
 * mode = 'view'   → lines only (click a line to select it)
 * mode = 'adjust' → drag the selected line's control points; double-click a point to remove it
 * mode = 'draw'   → click to place points for the selected line (replaces it)
 */
export default function PalmLineOverlay({ lines, hidden = {}, selected, onSelect, mode = 'view', onChange, labels = {} }) {
  const svgRef = useRef(null);
  const [dragIdx, setDragIdx] = useState(null);

  const toLocal = (e) => {
    const r = svgRef.current.getBoundingClientRect();
    return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))];
  };

  const sel = selected ? lines?.[selected] : null;

  const onPointerMove = (e) => {
    if (dragIdx == null || !sel) return;
    const pts = sel.points.map((p, i) => (i === dragIdx ? toLocal(e) : p));
    onChange?.(selected, pts);
  };

  const onBackgroundClick = (e) => {
    if (mode !== 'draw' || !selected) return;
    const pts = [...(sel?.drawing ? sel.points : []), toLocal(e)];
    onChange?.(selected, pts, { drawing: true });
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1000 1000"
      className={`absolute inset-0 h-full w-full ${mode === 'draw' ? 'cursor-crosshair' : ''}`}
      onPointerMove={onPointerMove}
      onPointerUp={() => setDragIdx(null)}
      onPointerLeave={() => setDragIdx(null)}
      onClick={onBackgroundClick}
      role="img"
      aria-label={Object.values(labels).join(', ')}
    >
      <defs>
        <filter id="plo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {LINE_IDS.map((id) => {
        const l = lines?.[id];
        if (!l || hidden[id] || !l.points?.length) return null;
        const isSel = selected === id;
        const dashed = !l.visible || l.status === 'weak';
        return (
          <g key={id} opacity={selected && !isSel ? 0.45 : 1}>
            {l.points.length > 1 && (
              <>
                <path
                  d={curvePath(l.points)}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="40"
                  className={mode === 'view' ? 'cursor-pointer' : ''}
                  onClick={(e) => {
                    if (mode === 'draw') return;
                    e.stopPropagation();
                    onSelect?.(id);
                  }}
                />
                <path
                  d={curvePath(l.points)}
                  fill="none"
                  stroke={LINE_COLORS[id]}
                  strokeWidth={isSel ? 11 : 8}
                  strokeLinecap="round"
                  strokeDasharray={dashed ? '18 16' : undefined}
                  filter="url(#plo-glow)"
                  pointerEvents="none"
                />
              </>
            )}
            {isSel && (mode === 'adjust' || mode === 'draw') &&
              l.points.map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x * 1000}
                  cy={y * 1000}
                  r={dragIdx === i ? 22 : 17}
                  fill="#0b0b18"
                  stroke={LINE_COLORS[id]}
                  strokeWidth="6"
                  className="cursor-grab touch-none"
                  onPointerDown={(e) => {
                    if (mode !== 'adjust') return;
                    e.stopPropagation();
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    setDragIdx(i);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (l.points.length > 2) onChange?.(id, l.points.filter((_, k) => k !== i));
                  }}
                />
              ))}
          </g>
        );
      })}
    </svg>
  );
}

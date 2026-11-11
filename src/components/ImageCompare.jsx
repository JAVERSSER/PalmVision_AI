import { useState } from 'react';

/** Before/after slider comparing two same-sized images. */
export default function ImageCompare({ before, after, beforeLabel, afterLabel }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative aspect-square w-full select-none overflow-hidden rounded-2xl border border-line bg-black">
      <img src={after} alt={afterLabel} className="absolute inset-0 h-full w-full object-contain" draggable="false" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={beforeLabel} className="absolute inset-0 h-full w-full object-contain" draggable="false" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-gold shadow-[0_0_12px_rgba(216,181,109,.9)]" style={{ left: `${pos}%` }} />
      <span className="absolute left-3 top-3 chip bg-bg/80 text-ink">{beforeLabel}</span>
      <span className="absolute right-3 top-3 chip bg-bg/80 text-ink">{afterLabel}</span>
      <input
        type="range"
        min="0"
        max="100"
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-x-0 bottom-3 mx-auto w-2/3 accent-[#D8B56D]"
        aria-label={`${beforeLabel} / ${afterLabel}`}
      />
    </div>
  );
}

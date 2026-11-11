/** Horizontal meter for 0–100 values. Colour reflects the band. */
export default function ConfidenceMeter({ value = 0, label, color, compact = false }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const bar = color || (v >= 70 ? '#34d399' : v >= 45 ? '#a78bfa' : v > 0 ? '#fbbf24' : '#f87171');
  return (
    <div className="w-full">
      {(label || !compact) && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-muted">{label}</span>
          <span className="font-semibold tabular-nums text-ink">{v}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8" role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${v}%`, background: bar }} />
      </div>
    </div>
  );
}

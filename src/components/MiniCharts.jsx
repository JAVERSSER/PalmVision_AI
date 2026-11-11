import { useState } from 'react';

// Small dependency-free SVG charts for the admin dashboard.
// Specs: bars ≤ 24px with a 4px rounded data-end and square baseline, hairline
// recessive grid, labels in text colours (never the series colour), per-mark
// hover tooltip, and a table view for every chart.

function niceMax(v) {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / p) * p;
}

/** Path for a column with a rounded top (r) and a square base. */
function columnPath(x, y, w, h, r = 4) {
  if (h <= 0) return '';
  const rr = Math.min(r, h, w / 2);
  return `M${x} ${y + h}V${y + rr}Q${x} ${y} ${x + rr} ${y}H${x + w - rr}Q${x + w} ${y} ${x + w} ${y + rr}V${y + h}Z`;
}

function TableView({ caption, rows, headers }) {
  return (
    <details className="mt-2 text-xs text-muted">
      <summary className="cursor-pointer select-none hover:text-ink">{caption}</summary>
      <table className="mt-2 w-full text-left">
        <thead>
          <tr>{headers.map((h) => <th key={h} className="py-1 pr-3 font-medium text-ink">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t border-line">
              {r.map((c, i) => <td key={i} className="py-1 pr-3 tabular-nums">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

/**
 * Single-series column chart (e.g. scans per day). No legend — the card title names the series.
 * @param {{label: string, value: number}[]} data
 */
export function ColumnChart({ data, color = '#A78BFA', height = 180, tableCaption = 'Table', headers = ['', ''] }) {
  const [hover, setHover] = useState(null);
  const W = 560, H = height, padL = 28, padB = 22, padT = 10;
  const max = niceMax(Math.max(1, ...data.map((d) => d.value)));
  const band = (W - padL) / data.length;
  const bw = Math.min(24, band * 0.62);
  const y = (v) => padT + (H - padT - padB) * (1 - v / max);
  const ticks = [0, max / 2, max];
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={tableCaption} onMouseLeave={() => setHover(null)}>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={padL} x2={W} y1={y(tk)} y2={y(tk)} stroke="currentColor" className="text-white/10" strokeWidth="1" />
            <text x={padL - 6} y={y(tk) + 3} textAnchor="end" className="fill-muted text-[10px]">{Math.round(tk)}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = padL + i * band + (band - bw) / 2;
          return (
            <g key={d.label} onMouseEnter={() => setHover(i)}>
              <rect x={padL + i * band} y={padT} width={band} height={H - padT - padB} fill="transparent" />
              <path d={columnPath(x, y(d.value), bw, y(0) - y(d.value))} fill={color} opacity={hover == null || hover === i ? 1 : 0.45} />
              {(i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) && (
                <text x={x + bw / 2} y={H - 6} textAnchor="middle" className="fill-muted text-[10px]">{d.short || d.label}</text>
              )}
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div className="pointer-events-none absolute top-0 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs shadow-lg" style={{ left: `${((padL + hover * band + band / 2) / W) * 100}%`, transform: 'translateX(-50%)' }}>
          <p className="text-muted">{data[hover].label}</p>
          <p className="font-semibold text-ink">{data[hover].value}</p>
        </div>
      )}
      <TableView caption={tableCaption} headers={headers} rows={data.map((d) => [d.label, d.value])} />
    </div>
  );
}

/**
 * Labelled horizontal bars. Each item carries its own colour swatch and a text
 * label, so identity never relies on colour alone.
 * @param {{key, label, value, color, icon?, display?}[]} items
 */
export function BarList({ items, max, unit = '', tableCaption = 'Table', headers = ['', ''] }) {
  const [hover, setHover] = useState(null);
  const top = max ?? Math.max(1, ...items.map((i) => i.value));
  return (
    <div>
      <ul className="space-y-3">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.key} onMouseEnter={() => setHover(it.key)} onMouseLeave={() => setHover(null)}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="flex items-center gap-1.5 text-ink">
                  {Icon ? <Icon className="h-3.5 w-3.5" style={{ color: it.color }} aria-hidden="true" /> : <span className="h-2 w-2 rounded-full" style={{ background: it.color }} />}
                  {it.label}
                </span>
                <span className="tabular-nums text-muted">{it.display ?? `${it.value}${unit}`}</span>
              </div>
              <div className="h-2.5 w-full rounded-r-[4px] bg-white/[0.04]">
                <div className="h-full rounded-r-[4px] transition-[width] duration-700" style={{ width: `${(it.value / top) * 100}%`, background: it.color, opacity: hover && hover !== it.key ? 0.45 : 1 }} />
              </div>
            </li>
          );
        })}
      </ul>
      <TableView caption={tableCaption} headers={headers} rows={items.map((i) => [i.label, i.display ?? `${i.value}${unit}`])} />
    </div>
  );
}

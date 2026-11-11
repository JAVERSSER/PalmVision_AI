import { motion } from 'framer-motion';

// Stylised open hand (SVG) with glowing palm lines, landmark dots and a scan beam.
const HAND =
  'M150 470 C110 430 92 380 88 330 L70 238 C66 214 96 206 104 230 L128 300 L120 120 C118 92 154 90 156 118 L166 268 L168 86 C168 56 206 56 206 86 L210 262 L218 104 C220 76 256 78 256 106 L250 276 L268 150 C272 124 306 128 304 156 L288 330 C284 400 262 446 236 474 Z';

const LINES = [
  { d: 'M118 300 C150 330 168 380 172 452', color: '#22c55e', delay: 0.2 },
  { d: 'M116 296 C160 300 210 318 250 352', color: '#3b82f6', delay: 0.5 },
  { d: 'M286 268 C250 262 210 262 172 250', color: '#ef4444', delay: 0.8 },
  { d: 'M204 462 C200 400 198 340 196 270', color: '#d8b56d', delay: 1.1 },
];

const DOTS = [
  [150, 470], [104, 330], [96, 262], [80, 236], [140, 296], [128, 210], [126, 150], [124, 108],
  [166, 268], [166, 200], [168, 140], [170, 80], [210, 262], [214, 190], [216, 130], [238, 92],
  [250, 276], [262, 220], [276, 170], [292, 142], [230, 470],
];

export default function HeroPalm({ className = '' }) {
  return (
    <div className={`relative mx-auto aspect-[4/5] w-full max-w-[420px] ${className}`}>
      <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(167,139,250,.35),transparent_65%)] blur-2xl" aria-hidden="true" />
      <svg viewBox="40 40 300 460" className="relative h-full w-full" role="img" aria-label="Illustration of a palm being scanned with the four major palm lines highlighted">
        <defs>
          <linearGradient id="hp-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A78BFA" stopOpacity="0.20" />
            <stop offset="1" stopColor="#17152B" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="hp-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C4B5FD" />
            <stop offset="1" stopColor="#D8B56D" />
          </linearGradient>
          <filter id="hp-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="hp-clip">
            <path d={HAND} />
          </clipPath>
        </defs>
        <path d={HAND} fill="url(#hp-fill)" stroke="url(#hp-stroke)" strokeWidth="2" strokeLinejoin="round" />
        {/* grid inside the hand */}
        <g clipPath="url(#hp-clip)" opacity="0.18" stroke="#A78BFA" strokeWidth="0.6">
          {Array.from({ length: 22 }, (_, i) => <line key={`h${i}`} x1="40" x2="340" y1={60 + i * 20} y2={60 + i * 20} />)}
          {Array.from({ length: 16 }, (_, i) => <line key={`v${i}`} y1="40" y2="500" x1={50 + i * 20} x2={50 + i * 20} />)}
        </g>
        {LINES.map((l) => (
          <motion.path
            key={l.d}
            d={l.d}
            fill="none"
            stroke={l.color}
            strokeWidth="4"
            strokeLinecap="round"
            filter="url(#hp-glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.4, delay: l.delay, ease: 'easeInOut' }}
          />
        ))}
        {DOTS.map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r="3" fill="#F8FAFC" stroke="#A78BFA" strokeWidth="1.5" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.6 + i * 0.03 }} />
        ))}
        <g clipPath="url(#hp-clip)">
          <rect className="scan-beam" x="40" y="40" width="300" height="70" fill="url(#hp-beam)" />
        </g>
        <defs>
          <linearGradient id="hp-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A78BFA" stopOpacity="0" />
            <stop offset="0.85" stopColor="#A78BFA" stopOpacity="0.35" />
            <stop offset="1" stopColor="#E9D5FF" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
      {/* corner brackets */}
      {['left-0 top-0 border-l-2 border-t-2', 'right-0 top-0 border-r-2 border-t-2', 'left-0 bottom-0 border-l-2 border-b-2', 'right-0 bottom-0 border-r-2 border-b-2'].map((c) => (
        <span key={c} className={`absolute h-8 w-8 rounded-sm border-gold/70 ${c}`} aria-hidden="true" />
      ))}
    </div>
  );
}

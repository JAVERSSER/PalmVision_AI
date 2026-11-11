import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="pv-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#D8B56D" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#pv-logo)" opacity="0.14" />
      <rect x="0.5" y="0.5" width="63" height="63" rx="17.5" fill="none" stroke="url(#pv-logo)" strokeOpacity="0.5" />
      <path d="M22 50c-5-6-8-12-8-19 0-2 2-3 3-1l4 7V15c0-2 3-2 3 0v13-17c0-2 3-2 3 0v17-19c0-2 3-2 3 0v19-16c0-2 3-2 3 0v19-13c0-2 3-2 3 0v20c0 8-3 13-6 17z" fill="none" stroke="url(#pv-logo)" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M25 40c4-2 8-2 12 1" stroke="#D8B56D" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M24 34c3-1 7-1 10 0" stroke="#A78BFA" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ to = '/', compact = false }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5" aria-label="PalmVision AI home">
      <LogoMark className="h-9 w-9 transition-transform duration-300 group-hover:rotate-[-6deg]" />
      {!compact && (
        <span className="font-serif text-xl font-semibold tracking-wide">
          Palm<span className="text-gradient">Vision</span> <span className="text-gold">AI</span>
        </span>
      )}
    </Link>
  );
}

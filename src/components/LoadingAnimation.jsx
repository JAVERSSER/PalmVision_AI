import { motion } from 'framer-motion';

/** Concentric "scanning" rings with an optional label. */
export default function LoadingAnimation({ label, sublabel, size = 96, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 text-center ${className}`} role="status" aria-live="polite">
      <div className="relative" style={{ width: size, height: size }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-primary/50"
            initial={{ scale: 0.4, opacity: 0.9 }}
            animate={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
          />
        ))}
        <motion.span
          className="absolute inset-[30%] rounded-full bg-gradient-to-br from-primary to-gold shadow-[0_0_30px_rgba(167,139,250,.6)]"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </div>
      {label && <p className="text-sm font-medium text-ink">{label}</p>}
      {sublabel && <p className="max-w-xs text-xs text-muted">{sublabel}</p>}
    </div>
  );
}

export function Spinner({ className = 'h-4 w-4' }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-hidden="true" />;
}

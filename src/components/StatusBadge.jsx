import { CircleCheck, TriangleAlert, CircleAlert, Info, LoaderCircle } from 'lucide-react';

const STYLES = {
  success: { cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-400', Icon: CircleCheck },
  warning: { cls: 'border-amber-400/30 bg-amber-400/10 text-amber-400', Icon: TriangleAlert },
  error: { cls: 'border-red-400/30 bg-red-400/10 text-red-400', Icon: CircleAlert },
  info: { cls: 'border-primary/30 bg-primary/10 text-primary', Icon: Info },
  loading: { cls: 'border-primary/30 bg-primary/10 text-primary', Icon: LoaderCircle },
  neutral: { cls: 'border-line bg-white/5 text-muted', Icon: null },
};

export default function StatusBadge({ status = 'neutral', children, className = '', icon = true }) {
  const { cls, Icon } = STYLES[status] || STYLES.neutral;
  return (
    <span className={`chip ${cls} ${className}`}>
      {icon && Icon && <Icon className={`h-3.5 w-3.5 ${status === 'loading' ? 'animate-spin' : ''}`} aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Maps a 0–100 confidence to a badge status. */
export const confidenceStatus = (c) => (c >= 70 ? 'success' : c >= 45 ? 'info' : c > 0 ? 'warning' : 'error');

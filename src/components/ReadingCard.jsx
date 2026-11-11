import { Link } from 'react-router-dom';
import { Sparkles, Heart, Briefcase, Star, ArrowRight } from 'lucide-react';
import { CATEGORY_META } from '../data/readingData.js';
import { useT } from '../i18n/index.js';

export const CATEGORY_ICONS = { personality: Sparkles, love: Heart, career: Briefcase, fortune: Star };

/** Category tile used for shortcuts and report previews. */
export default function ReadingCard({ category, to, description, active, onClick, compact = false }) {
  const { lang } = useT();
  const meta = CATEGORY_META[category];
  const Icon = CATEGORY_ICONS[category];
  const body = (
    <>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${meta.color}1f`, color: meta.color }}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block font-semibold text-ink">{meta.title[lang]}</span>
        {!compact && <span className="mt-0.5 block text-xs leading-relaxed text-muted">{description || meta.tagline[lang]}</span>}
      </span>
      {to && <ArrowRight className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />}
    </>
  );
  const cls = `group flex w-full items-center gap-3 rounded-2xl border p-4 transition ${
    active ? 'border-primary/60 bg-primary/10' : 'border-line bg-white/[0.02] hover:border-primary/40 hover:bg-primary/5'
  }`;
  if (to) return <Link to={to} className={cls}>{body}</Link>;
  return (
    <button type="button" className={cls} onClick={onClick} aria-pressed={active}>
      {body}
    </button>
  );
}

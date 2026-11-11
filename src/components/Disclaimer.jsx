import { Info } from 'lucide-react';
import { useT } from '../i18n/index.js';

/** Entertainment disclaimer shown on the landing page, scanner and every report. */
export default function Disclaimer({ variant = 'full', className = '' }) {
  const { t } = useT();
  if (variant === 'inline') {
    return (
      <p className={`flex items-start gap-2 text-xs text-muted ${className}`}>
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden="true" />
        {t('disclaimer.short')}
      </p>
    );
  }
  return (
    <aside className={`rounded-2xl border border-gold/25 bg-gold/5 p-4 text-sm ${className}`} role="note">
      <p className="flex items-center gap-2 font-semibold text-gold">
        <Info className="h-4 w-4" aria-hidden="true" /> {t('disclaimer.title')}
      </p>
      <p className="mt-1.5 leading-relaxed text-muted">{t('disclaimer.body')}</p>
    </aside>
  );
}

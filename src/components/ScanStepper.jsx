import { Check } from 'lucide-react';
import { useT } from '../i18n/index.js';

export const SCAN_STEPS = ['waiting', 'detecting', 'detected', 'quality', 'processing', 'complete'];

/** The six scanning states, highlighting the current one. */
export default function ScanStepper({ current }) {
  const { t } = useT();
  const idx = SCAN_STEPS.indexOf(current);
  return (
    <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label={t('scanner.stepsLabel')}>
      {SCAN_STEPS.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li
            key={step}
            aria-current={active ? 'step' : undefined}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-[11px] font-medium leading-tight transition ${
              active ? 'border-primary/60 bg-primary/12 text-ink' : done ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-300' : 'border-line text-muted'
            }`}
          >
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] ${active ? 'bg-primary text-white' : done ? 'bg-emerald-500 text-white' : 'bg-white/5'}`}>
              {done ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {t(`scanner.steps.${step}`)}
          </li>
        );
      })}
    </ol>
  );
}

import { Link } from 'react-router-dom';
import { ScanLine, History as HistoryIcon, Gauge, Image as ImageIcon, BookOpen, CircleCheck, Circle, ArrowRight, Hand, Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import AnalysisCard from '../components/AnalysisCard.jsx';
import ReadingCard from '../components/ReadingCard.jsx';
import PalmSketch from '../components/PalmSketch.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge, { confidenceStatus } from '../components/StatusBadge.jsx';
import LoadingAnimation from '../components/LoadingAnimation.jsx';
import Disclaimer from '../components/Disclaimer.jsx';
import { useT } from '../i18n/index.js';
import { useStore } from '../hooks/useStore.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { listScans } from '../services/storageService.js';
import { CATEGORIES } from '../data/readingData.js';
import { formatDateTime, relativeTime } from '../utils/dateHelpers.js';

function Stat({ icon: Icon, label, value, hint }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted">{label}</p>
        <p className="truncate font-serif text-3xl font-semibold leading-tight">{value}</p>
        {hint && <p className="truncate text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}

export function ScanThumb({ scan, className = 'aspect-square w-full' }) {
  const lines = scan.lines || scan.features?.raw?.linesGeometry;
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-bg-2 ${className}`}>
      {scan.imageReference ? (
        <div className="relative h-full w-full">
          <img src={scan.imageReference} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0">
            <PalmSketch lines={lines} className="h-full w-full [&>rect]:opacity-0" />
          </div>
        </div>
      ) : (
        <PalmSketch polygon={scan.polygon} lines={lines} />
      )}
    </div>
  );
}

export default function Dashboard() {
  const { t, lang } = useT();
  const { user } = useSettings();
  const { data: scans, loading } = useStore(() => listScans({ userId: user?.id }), [user?.id]);

  if (loading || !user) return <LoadingAnimation className="py-32" label={t('common.loading')} />;

  const latest = scans?.[0];
  const avgConf = scans?.length ? Math.round(scans.reduce((s, x) => s + (x.features?.detectionConfidence?.overall || 0), 0) / scans.length) : 0;
  const imagesSaved = scans.filter((s) => s.imageReference).length;

  const guide = [
    { done: !!user.name, label: t('dashboard.guide.profile'), to: '/profile' },
    { done: scans.length > 0, label: t('dashboard.guide.scan'), to: '/scan' },
    { done: scans.some((s) => s.readings?.length), label: t('dashboard.guide.reading'), to: latest ? `/results/${latest.id}` : '/scan' },
    { done: scans.length > 1, label: t('dashboard.guide.compare'), to: '/history' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('dashboard.eyebrow')}
        title={user.name ? t('dashboard.welcomeName', { name: user.name }) : t('dashboard.welcome')}
        description={t('dashboard.subtitle')}
        actions={
          <Link to="/scan" className="btn-gold">
            <ScanLine className="h-4 w-4" /> {t('dashboard.newScan')}
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Hand} label={t('dashboard.stats.scans')} value={scans.length} hint={latest ? relativeTime(latest.scanDate, lang) : t('dashboard.stats.none')} />
        <Stat icon={BookOpen} label={t('dashboard.stats.readings')} value={scans.reduce((s, x) => s + (x.readings?.length || 0), 0)} />
        <Stat icon={Gauge} label={t('dashboard.stats.confidence')} value={scans.length ? `${avgConf}%` : '—'} hint={t('dashboard.stats.confidenceHint')} />
        <Stat icon={ImageIcon} label={t('dashboard.stats.images')} value={imagesSaved} hint={t('dashboard.stats.imagesHint')} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <AnalysisCard
          icon={HistoryIcon}
          title={t('dashboard.recent')}
          action={scans.length > 0 && <Link className="text-xs text-primary hover:underline" to="/history">{t('common.viewAll')}</Link>}
        >
          {scans.length === 0 ? (
            <EmptyState
              icon={ScanLine}
              title={t('dashboard.emptyTitle')}
              body={t('dashboard.emptyBody')}
              action={<Link to="/scan" className="btn-primary"><ScanLine className="h-4 w-4" /> {t('dashboard.newScan')}</Link>}
            />
          ) : (
            <ul className="divide-y divide-line">
              {scans.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <Link to={`/results/${s.id}`} className="group flex items-center gap-4 py-3">
                    <ScanThumb scan={s} className="h-14 w-14 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{t(`hand.${s.handType}Palm`)}</p>
                      <p className="text-xs text-muted">{formatDateTime(s.scanDate, lang)} · {t('dashboard.readingsCount', { n: s.readings?.length || 0 })}</p>
                    </div>
                    <StatusBadge status={confidenceStatus(s.features?.detectionConfidence?.overall || 0)}>{s.features?.detectionConfidence?.overall ?? 0}%</StatusBadge>
                    <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </AnalysisCard>

        <AnalysisCard icon={Sparkles} title={t('dashboard.latest')}>
          {latest ? (
            <div className="space-y-4">
              <ScanThumb scan={latest} className="mx-auto aspect-square w-full max-w-xs" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{t(`hand.${latest.handType}Palm`)}</p>
                  <p className="text-xs text-muted">{formatDateTime(latest.scanDate, lang)}</p>
                </div>
                <Link to={`/results/${latest.id}`} className="btn-ghost">
                  {t('dashboard.openReport')} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">{t('dashboard.noLatest')}</p>
          )}
        </AnalysisCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalysisCard icon={BookOpen} title={t('dashboard.categories')} subtitle={latest ? t('dashboard.categoriesHint') : t('dashboard.categoriesHintEmpty')}>
          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <ReadingCard key={c} category={c} compact to={latest ? `/results/${latest.id}?tab=${c}` : '/scan'} />
            ))}
          </div>
        </AnalysisCard>
        <AnalysisCard icon={CircleCheck} title={t('dashboard.guide.title')} subtitle={t('dashboard.guide.subtitle', { done: guide.filter((g) => g.done).length, total: guide.length })}>
          <ol className="space-y-2">
            {guide.map((g) => (
              <li key={g.label}>
                <Link to={g.to} className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-white/5">
                  {g.done ? <CircleCheck className="h-5 w-5 text-emerald-400" /> : <Circle className="h-5 w-5 text-muted" />}
                  <span className={g.done ? 'text-muted line-through' : 'text-ink'}>{g.label}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-xl bg-white/[0.03] p-4 text-xs leading-relaxed text-muted">
            <p className="mb-1 font-semibold text-ink">{t('dashboard.tipsTitle')}</p>
            <ul className="list-inside list-disc space-y-1">
              <li>{t('scanner.tips.light')}</li>
              <li>{t('scanner.tips.flat')}</li>
              <li>{t('scanner.tips.fill')}</li>
            </ul>
          </div>
        </AnalysisCard>
      </div>
      <Disclaimer variant="inline" />
    </div>
  );
}

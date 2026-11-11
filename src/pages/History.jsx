import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trash2, Eye, ScanLine, History as HistoryIcon, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import LoadingAnimation from '../components/LoadingAnimation.jsx';
import StatusBadge, { confidenceStatus } from '../components/StatusBadge.jsx';
import { CATEGORY_ICONS } from '../components/ReadingCard.jsx';
import { ScanThumb } from './Dashboard.jsx';
import { useT } from '../i18n/index.js';
import { useStore } from '../hooks/useStore.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { listScans, deleteScan } from '../services/storageService.js';
import { CATEGORY_META } from '../data/readingData.js';
import { formatDateTime } from '../utils/dateHelpers.js';

const RANGES = { all: Infinity, '7': 7, '30': 30, '90': 90 };

export default function History() {
  const { t, lang } = useT();
  const { user } = useSettings();
  const { data: scans, loading } = useStore(() => listScans({ userId: user?.id }), [user?.id]);
  const [query, setQuery] = useState('');
  const [hand, setHand] = useState('all');
  const [status, setStatus] = useState('all');
  const [range, setRange] = useState('all');
  const [sort, setSort] = useState('newest');
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(() => {
    if (!scans) return [];
    const q = query.trim().toLowerCase();
    const cutoff = RANGES[range] === Infinity ? 0 : Date.now() - RANGES[range] * 86400000;
    const out = scans.filter((s) => {
      if (hand !== 'all' && s.handType !== hand) return false;
      if (status !== 'all' && s.detectionStatus !== status) return false;
      if (new Date(s.scanDate).getTime() < cutoff) return false;
      if (!q) return true;
      const text = [
        formatDateTime(s.scanDate, lang),
        t(`hand.${s.handType}Palm`),
        ...s.readings.flatMap((r) => [r.interpretation?.[lang]?.title, r.interpretation?.[lang]?.summary, ...(r.interpretation?.[lang]?.details || []).map((d) => d.heading)]),
      ]
        .join(' ')
        .toLowerCase();
      return text.includes(q);
    });
    return sort === 'oldest' ? out.reverse() : out;
  }, [scans, query, hand, status, range, sort, lang, t]);

  if (loading) return <LoadingAnimation className="py-32" label={t('common.loading')} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('history.eyebrow')}
        title={t('history.title')}
        description={t('history.subtitle', { n: scans.length })}
        actions={<Link to="/scan" className="btn-gold"><ScanLine className="h-4 w-4" /> {t('dashboard.newScan')}</Link>}
      />

      {scans.length === 0 ? (
        <EmptyState icon={HistoryIcon} title={t('history.emptyTitle')} body={t('history.emptyBody')} action={<Link to="/scan" className="btn-primary"><ScanLine className="h-4 w-4" /> {t('dashboard.newScan')}</Link>} />
      ) : (
        <>
          <div className="card flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
            <label className="relative flex-1">
              <span className="sr-only">{t('history.search')}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input className="input pl-9" placeholder={t('history.searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="hidden h-4 w-4 text-muted lg:block" aria-hidden="true" />
              <select className="input w-auto" value={hand} onChange={(e) => setHand(e.target.value)} aria-label={t('history.filterHand')}>
                <option value="all">{t('history.allHands')}</option>
                <option value="left">{t('hand.left')}</option>
                <option value="right">{t('hand.right')}</option>
              </select>
              <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t('history.filterStatus')}>
                <option value="all">{t('history.allStatuses')}</option>
                <option value="detected">{t('history.status.detected')}</option>
                <option value="manual">{t('history.status.manual')}</option>
                <option value="low_confidence">{t('history.status.low_confidence')}</option>
              </select>
              <select className="input w-auto" value={range} onChange={(e) => setRange(e.target.value)} aria-label={t('history.filterDate')}>
                <option value="all">{t('history.range.all')}</option>
                <option value="7">{t('history.range.7')}</option>
                <option value="30">{t('history.range.30')}</option>
                <option value="90">{t('history.range.90')}</option>
              </select>
              <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label={t('history.sort')}>
                <option value="newest">{t('history.newest')}</option>
                <option value="oldest">{t('history.oldest')}</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title={t('history.noMatchTitle')} body={t('history.noMatchBody')} />
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {filtered.map((s) => {
                const preview = s.readings.find((r) => r.category === 'personality')?.interpretation?.[lang]?.summary || '';
                const overall = s.features?.detectionConfidence?.overall ?? 0;
                return (
                  <li key={s.id} className="card flex gap-4 p-4">
                    <ScanThumb scan={s} className="h-28 w-28 shrink-0" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{t(`hand.${s.handType}Palm`)}</p>
                        <StatusBadge status={confidenceStatus(overall)} icon={false}>{overall}%</StatusBadge>
                        {s.imageReference && <ImageIcon className="h-3.5 w-3.5 text-muted" aria-label={t('history.hasImage')} />}
                      </div>
                      <p className="text-xs text-muted">{formatDateTime(s.scanDate, lang)} · {t(`history.status.${s.detectionStatus || 'detected'}`)}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {s.readings.map((r) => {
                          const Icon = CATEGORY_ICONS[r.category];
                          return (
                            <Link key={r.id} to={`/results/${s.id}?tab=${r.category}`} className="chip text-muted hover:text-ink" title={CATEGORY_META[r.category].title[lang]}>
                              <Icon className="h-3 w-3" style={{ color: CATEGORY_META[r.category].color }} /> {CATEGORY_META[r.category].title[lang].split(' ')[0]}
                            </Link>
                          );
                        })}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{preview}</p>
                      <div className="mt-auto flex gap-2 pt-3">
                        <Link to={`/results/${s.id}`} className="btn-ghost px-3 py-1.5 text-xs"><Eye className="h-3.5 w-3.5" /> {t('history.view')}</Link>
                        <button className="btn-danger px-3 py-1.5 text-xs" onClick={() => setToDelete(s)}><Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <Modal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title={t('history.deleteTitle')}
        size="sm"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setToDelete(null)}>{t('common.cancel')}</button>
            <button
              className="btn-danger"
              onClick={async () => {
                await deleteScan(toDelete.id);
                setToDelete(null);
              }}
            >
              <Trash2 className="h-4 w-4" /> {t('common.delete')}
            </button>
          </>
        }
      >
        {t('history.deleteBody')}
      </Modal>
    </div>
  );
}

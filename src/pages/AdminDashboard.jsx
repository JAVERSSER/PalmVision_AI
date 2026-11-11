import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Users, ScanLine, BookOpen, Star, Gauge, Image as ImageIcon, CircleCheck, TriangleAlert, CircleAlert, Ban, Trash2, Eye, Pencil, RotateCcw, Search, Activity, Cpu, Bot, Timer, SlidersHorizontal, Save, MessageSquare, FileText,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import AnalysisCard from '../components/AnalysisCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import LoadingAnimation from '../components/LoadingAnimation.jsx';
import StatusBadge, { confidenceStatus } from '../components/StatusBadge.jsx';
import { ColumnChart, BarList } from '../components/MiniCharts.jsx';
import { Toggle } from './Settings.jsx';
import { useT } from '../i18n/index.js';
import { useStore } from '../hooks/useStore.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { listUsers, listScans, listFeedback, listEvents, deleteUser, deleteScan, deleteFeedback, clearEvents, saveUser, storageBackend } from '../services/storageService.js';
import { PALM_RULES } from '../utils/palmRules.js';
import { CATEGORIES, CATEGORY_META, LINE_NAMES } from '../data/readingData.js';
import { LINE_COLORS, LINE_IDS } from '../services/palmAnalysis.js';
import { DEFAULT_THRESHOLDS } from '../utils/imageValidation.js';
import { formatDateTime, formatDate, countByDay } from '../utils/dateHelpers.js';

const STATUS_COLORS = { good: '#34d399', warning: '#fbbf24', serious: '#fb923c', critical: '#f87171' };
const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0);

function Tile({ icon: Icon, label, value, hint }) {
  return (
    <div className="card p-4">
      <p className="flex items-center gap-2 text-xs text-muted"><Icon className="h-4 w-4 text-primary" /> {label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold">{value}</p>
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

function useAdminData() {
  return useStore(async () => {
    const [users, scans, feedback, events] = await Promise.all([listUsers(), listScans(), listFeedback(), listEvents()]);
    return { users, scans, feedback, events };
  }, []);
}

// ------------------------------------------------------------- overview ---
function Overview({ data }) {
  const { t, lang } = useT();
  const { users, scans, feedback, events } = data;
  const detections = events.filter((e) => e.type === 'detection');
  const accepted = detections.filter((e) => e.status === 'accepted').length;
  const perDay = countByDay(scans.map((s) => s.scanDate), 14).map((d) => ({ label: formatDate(d.date, lang), short: new Date(d.date).getDate().toString(), value: d.count }));
  const outcomes = [
    { key: 'accepted', label: t('admin.outcome.accepted'), value: accepted, color: STATUS_COLORS.good, icon: CircleCheck },
    { key: 'rejected', label: t('admin.outcome.rejected'), value: detections.filter((e) => e.status === 'rejected').length, color: STATUS_COLORS.warning, icon: TriangleAlert },
    { key: 'no_hand', label: t('admin.outcome.noHand'), value: detections.filter((e) => e.status === 'no_hand').length, color: STATUS_COLORS.serious, icon: Ban },
    { key: 'error', label: t('admin.outcome.error'), value: detections.filter((e) => e.status === 'error').length, color: STATUS_COLORS.critical, icon: CircleAlert },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Tile icon={Users} label={t('admin.tiles.users')} value={users.length} />
        <Tile icon={ScanLine} label={t('admin.tiles.scans')} value={scans.length} hint={t('admin.tiles.scansHint', { n: detections.length })} />
        <Tile icon={BookOpen} label={t('admin.tiles.readings')} value={scans.reduce((s, x) => s + x.readings.length, 0)} />
        <Tile icon={Gauge} label={t('admin.tiles.success')} value={detections.length ? `${Math.round((accepted / detections.length) * 100)}%` : '—'} hint={t('admin.tiles.successHint')} />
        <Tile icon={Star} label={t('admin.tiles.rating')} value={feedback.length ? avg(feedback.map((f) => f.rating)).toFixed(1) : '—'} hint={t('admin.tiles.ratingHint', { n: feedback.length })} />
        <Tile icon={ImageIcon} label={t('admin.tiles.images')} value={scans.filter((s) => s.imageReference).length} hint={t('admin.tiles.imagesHint')} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <AnalysisCard icon={Activity} title={t('admin.charts.scansPerDay')} subtitle={t('admin.charts.last14')}>
          <ColumnChart data={perDay} tableCaption={t('admin.viewTable')} headers={[t('admin.col.date'), t('admin.col.scans')]} />
        </AnalysisCard>
        <AnalysisCard icon={CircleCheck} title={t('admin.charts.outcomes')} subtitle={t('admin.charts.outcomesHint')}>
          {detections.length ? <BarList items={outcomes} tableCaption={t('admin.viewTable')} headers={[t('admin.col.outcome'), t('admin.col.count')]} /> : <p className="text-sm text-muted">{t('admin.noEvents')}</p>}
        </AnalysisCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- users ---
function UsersSection({ data }) {
  const { t, lang } = useT();
  const { user: me } = useSettings();
  const [toDelete, setToDelete] = useState(null);
  return (
    <AnalysisCard icon={Users} title={t('admin.nav.users')} subtitle={t('admin.usersHint')}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs text-muted">
            <tr><th className="py-2">{t('admin.col.user')}</th><th>{t('admin.col.role')}</th><th>{t('admin.col.scans')}</th><th>{t('admin.col.created')}</th><th className="text-right">{t('admin.col.actions')}</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data.users.map((u) => (
              <tr key={u.id}>
                <td className="py-3">
                  <p className="font-medium">{u.name || t('profile.anonymous')} {u.id === me?.id && <span className="chip ml-1 text-[10px] text-gold">{t('admin.you')}</span>}</p>
                  <p className="text-xs text-muted">{u.email || u.id}</p>
                </td>
                <td>
                  <select className="input w-auto py-1.5 text-xs" value={u.role || 'user'} onChange={(e) => saveUser({ ...u, role: e.target.value })} aria-label={t('admin.col.role')}>
                    <option value="user">{t('admin.roles.user')}</option>
                    <option value="admin">{t('admin.roles.admin')}</option>
                  </select>
                </td>
                <td className="tabular-nums">{data.scans.filter((s) => s.userId === u.id).length}</td>
                <td className="text-xs text-muted">{formatDate(u.createdAt, lang)}</td>
                <td className="text-right">
                  <button className="btn-danger px-2.5 py-1.5 text-xs" disabled={u.id === me?.id} onClick={() => setToDelete(u)}><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} size="sm" title={t('admin.deleteUser')} footer={<><button className="btn-ghost" onClick={() => setToDelete(null)}>{t('common.cancel')}</button><button className="btn-danger" onClick={async () => { await deleteUser(toDelete.id); setToDelete(null); }}><Trash2 className="h-4 w-4" /> {t('common.delete')}</button></>}>
        {t('admin.deleteUserBody')}
      </Modal>
    </AnalysisCard>
  );
}

// ---------------------------------------------------------------- scans ---
function ScansSection({ data }) {
  const { t, lang } = useT();
  const { scans, users } = data;
  const byHand = ['left', 'right'].map((h) => ({ key: h, label: t(`hand.${h}`), value: scans.filter((s) => s.handType === h).length, color: h === 'left' ? '#A78BFA' : '#D8B56D' }));
  const byStatus = [
    { key: 'detected', label: t('history.status.detected'), value: scans.filter((s) => s.detectionStatus === 'detected').length, color: STATUS_COLORS.good, icon: CircleCheck },
    { key: 'manual', label: t('history.status.manual'), value: scans.filter((s) => s.detectionStatus === 'manual').length, color: '#A78BFA', icon: Pencil },
    { key: 'low', label: t('history.status.low_confidence'), value: scans.filter((s) => s.detectionStatus === 'low_confidence').length, color: STATUS_COLORS.warning, icon: TriangleAlert },
  ];
  const userName = (id) => users.find((u) => u.id === id)?.name || id.slice(0, 10);
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <AnalysisCard icon={ScanLine} title={t('admin.scansByHand')}><BarList items={byHand} tableCaption={t('admin.viewTable')} headers={[t('admin.col.hand'), t('admin.col.count')]} /></AnalysisCard>
        <AnalysisCard icon={CircleCheck} title={t('admin.scansByStatus')}><BarList items={byStatus} tableCaption={t('admin.viewTable')} headers={[t('admin.col.status'), t('admin.col.count')]} /></AnalysisCard>
      </div>
      <AnalysisCard icon={ScanLine} title={t('admin.allScans')}>
        {scans.length === 0 ? <p className="text-sm text-muted">{t('history.emptyTitle')}</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-xs text-muted"><tr><th className="py-2">{t('admin.col.date')}</th><th>{t('admin.col.user')}</th><th>{t('admin.col.hand')}</th><th>{t('admin.col.status')}</th><th>{t('admin.col.confidence')}</th><th>{t('admin.col.engine')}</th><th className="text-right">{t('admin.col.actions')}</th></tr></thead>
              <tbody className="divide-y divide-line">
                {scans.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 text-xs">{formatDateTime(s.scanDate, lang)}</td>
                    <td className="text-xs">{userName(s.userId)}</td>
                    <td>{t(`hand.${s.handType}`)}</td>
                    <td className="text-xs">{t(`history.status.${s.detectionStatus || 'detected'}`)}</td>
                    <td><StatusBadge status={confidenceStatus(s.features?.detectionConfidence?.overall || 0)} icon={false}>{s.features?.detectionConfidence?.overall ?? 0}%</StatusBadge></td>
                    <td className="text-xs text-muted">{s.engine || '—'}{s.imageReference && <ImageIcon className="ml-1 inline h-3 w-3" />}</td>
                    <td className="space-x-1 text-right">
                      <Link to={`/results/${s.id}`} className="btn-ghost inline-flex px-2.5 py-1.5 text-xs" aria-label={t('history.view')}><Eye className="h-3.5 w-3.5" /></Link>
                      <button className="btn-danger px-2.5 py-1.5 text-xs" onClick={() => deleteScan(s.id)} aria-label={t('common.delete')}><Trash2 className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AnalysisCard>
    </div>
  );
}

// -------------------------------------------------------------- content ---
function ContentSection() {
  const { t, lang } = useT();
  const { settings, updateAdmin } = useSettings();
  const overrides = settings.admin.ruleOverrides || {};
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ en: '', km: '' });

  const setOverride = (id, patch) => {
    const next = { ...overrides, [id]: { ...(overrides[id] || {}), ...patch } };
    updateAdmin({ ruleOverrides: next });
  };
  const clearOverride = (id) => {
    const next = { ...overrides };
    delete next[id];
    updateAdmin({ ruleOverrides: next });
  };
  const rules = PALM_RULES.filter((r) => (cat === 'all' || r.category === cat) && (!q || `${r.id} ${r.heading.en} ${r.heading.km} ${r.text.en}`.toLowerCase().includes(q.toLowerCase())));

  return (
    <AnalysisCard icon={FileText} title={t('admin.nav.content')} subtitle={t('admin.contentHint', { n: PALM_RULES.length })}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder={t('admin.searchRules')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('admin.searchRules')} />
        </label>
        <select className="input w-auto" value={cat} onChange={(e) => setCat(e.target.value)} aria-label={t('admin.col.category')}>
          <option value="all">{t('admin.allCategories')}</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_META[c].title[lang]}</option>)}
        </select>
      </div>
      <ul className="divide-y divide-line">
        {rules.map((r) => {
          const o = overrides[r.id];
          const edited = !!(o?.text && (o.text.en || o.text.km));
          return (
            <li key={r.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {r.heading[lang]}
                  <span className="chip text-[10px] text-muted">{CATEGORY_META[r.category].title[lang]}</span>
                  {r.line && <span className="chip text-[10px] text-muted"><span className="h-1.5 w-1.5 rounded-full" style={{ background: LINE_COLORS[r.line] }} />{LINE_NAMES[r.line][lang]}</span>}
                  {edited && <span className="chip text-[10px] text-gold">{t('admin.edited')}</span>}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{(o?.text?.[lang]) || r.text[lang]}</p>
                <code className="text-[10px] text-muted/70">{r.id}</code>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Toggle checked={!o?.disabled} onChange={(v) => setOverride(r.id, { disabled: !v })} label={<span className="sr-only">{t('admin.ruleEnabled')}</span>} />
                <button className="btn-ghost px-2.5 py-1.5 text-xs" onClick={() => { setEditing(r); setDraft({ en: o?.text?.en || r.text.en, km: o?.text?.km || r.text.km }); }}><Pencil className="h-3.5 w-3.5" /> {t('common.edit')}</button>
                {o && <button className="btn-ghost px-2.5 py-1.5 text-xs" onClick={() => clearOverride(r.id)} aria-label={t('admin.resetRule')}><RotateCcw className="h-3.5 w-3.5" /></button>}
              </div>
            </li>
          );
        })}
      </ul>
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        size="lg"
        title={editing ? editing.heading[lang] : ''}
        footer={<><button className="btn-ghost" onClick={() => setEditing(null)}>{t('common.cancel')}</button><button className="btn-primary" onClick={() => { setOverride(editing.id, { text: draft }); setEditing(null); }}><Save className="h-4 w-4" /> {t('common.save')}</button></>}
      >
        <p className="mb-3 text-xs">{t('admin.editRuleHelp')}</p>
        {['en', 'km'].map((l) => (
          <label key={l} className="mb-3 block space-y-1">
            <span className="text-xs font-medium text-ink">{l === 'en' ? 'English' : 'ខ្មែរ'}</span>
            <textarea className="input min-h-28" value={draft[l]} maxLength={1200} onChange={(e) => setDraft({ ...draft, [l]: e.target.value })} />
          </label>
        ))}
      </Modal>
    </AnalysisCard>
  );
}

// ---------------------------------------------------------------- model ---
function ModelSection({ data }) {
  const { t, lang } = useT();
  const { events } = data;
  const analyses = events.filter((e) => e.type === 'analysis' && e.status === 'ok');
  const detections = events.filter((e) => e.type === 'detection');
  const generated = events.filter((e) => e.type === 'reading_generated');
  const llm = events.filter((e) => e.type === 'llm_request');
  const landmark = detections.filter((d) => d.landmarkScore != null).map((d) => d.landmarkScore * 100);

  const lineConf = LINE_IDS.map((id) => ({ key: id, label: LINE_NAMES[id][lang], color: LINE_COLORS[id], value: Math.round(avg(analyses.map((a) => a.lineConfidence?.[id] ?? 0))), unit: '%' }));
  const autoRate = LINE_IDS.map((id) => ({ key: id, label: LINE_NAMES[id][lang], color: LINE_COLORS[id], value: analyses.length ? Math.round((analyses.filter((a) => a.lineStatus?.[id] === 'detected').length / analyses.length) * 100) : 0 }));
  const corrections = LINE_IDS.map((id) => ({ key: id, label: LINE_NAMES[id][lang], color: LINE_COLORS[id], value: generated.length ? Math.round((generated.filter((g) => g.manualLines?.includes(id)).length / generated.length) * 100) : 0 }));
  const engines = ['opencv', 'javascript'].map((e) => ({ key: e, label: e === 'opencv' ? 'OpenCV.js' : t('analysis.jsEngine'), value: analyses.filter((a) => a.engine === e).length, color: e === 'opencv' ? '#A78BFA' : STATUS_COLORS.warning }));

  if (!events.length) return <EmptyState icon={Activity} title={t('admin.noEvents')} body={t('admin.noEventsBody')} />;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile icon={Cpu} label={t('admin.model.analyses')} value={analyses.length} hint={t('admin.model.failures', { n: events.filter((e) => e.type === 'analysis' && e.status !== 'ok').length })} />
        <Tile icon={Gauge} label={t('admin.model.landmark')} value={landmark.length ? `${Math.round(avg(landmark))}%` : '—'} hint="MediaPipe" />
        <Tile icon={Timer} label={t('admin.model.time')} value={analyses.length ? `${Math.round(avg(analyses.map((a) => a.totalMs)))} ms` : '—'} hint={t('admin.model.timeHint')} />
        <Tile icon={Bot} label={t('admin.model.llm')} value={llm.length ? `${llm.filter((l) => l.ok).length}/${llm.length}` : '—'} hint={t('admin.model.llmHint')} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <AnalysisCard icon={Gauge} title={t('admin.model.lineConfidence')} subtitle={t('admin.model.lineConfidenceHint')}>
          <BarList items={lineConf} max={100} unit="%" tableCaption={t('admin.viewTable')} headers={[t('admin.col.line'), t('admin.col.confidence')]} />
        </AnalysisCard>
        <AnalysisCard icon={CircleCheck} title={t('admin.model.autoRate')} subtitle={t('admin.model.autoRateHint')}>
          <BarList items={autoRate} max={100} unit="%" tableCaption={t('admin.viewTable')} headers={[t('admin.col.line'), '%']} />
        </AnalysisCard>
        <AnalysisCard icon={Pencil} title={t('admin.model.corrections')} subtitle={t('admin.model.correctionsHint')}>
          {generated.length ? <BarList items={corrections} max={100} unit="%" tableCaption={t('admin.viewTable')} headers={[t('admin.col.line'), '%']} /> : <p className="text-sm text-muted">{t('admin.noEvents')}</p>}
        </AnalysisCard>
        <AnalysisCard icon={Cpu} title={t('admin.model.engines')} subtitle={t('admin.model.enginesHint')}>
          <BarList items={engines} tableCaption={t('admin.viewTable')} headers={[t('admin.col.engine'), t('admin.col.count')]} />
        </AnalysisCard>
      </div>
      <AnalysisCard icon={Activity} title={t('admin.model.recent')} action={<button className="btn-danger px-3 py-1.5 text-xs" onClick={clearEvents}><Trash2 className="h-3.5 w-3.5" /> {t('admin.model.clear')}</button>}>
        <ul className="max-h-72 divide-y divide-line overflow-y-auto text-xs">
          {[...events].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50).map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-2 py-2">
              <span className="w-36 shrink-0 text-muted">{formatDateTime(e.createdAt, lang)}</span>
              <span className="chip text-[10px]">{e.type}</span>
              <span className="text-muted">{e.status || ''} {e.engine || ''} {e.totalMs ? `${e.totalMs}ms` : ''} {e.reasons?.length ? e.reasons.join(', ') : ''}</span>
            </li>
          ))}
        </ul>
      </AnalysisCard>
    </div>
  );
}

// ------------------------------------------------------------- feedback ---
function FeedbackSection({ data }) {
  const { t, lang } = useT();
  const { feedback, scans } = data;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ key: n, label: '★'.repeat(n), value: feedback.filter((f) => f.rating === n).length, color: '#D8B56D' }));
  const readingOf = (f) => scans.flatMap((s) => s.readings).find((r) => r.id === f.readingId);
  if (!feedback.length) return <EmptyState icon={MessageSquare} title={t('admin.noFeedback')} body={t('admin.noFeedbackBody')} />;
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <AnalysisCard icon={Star} title={t('admin.ratingDist')} subtitle={t('admin.tiles.ratingHint', { n: feedback.length })}>
        <BarList items={dist} tableCaption={t('admin.viewTable')} headers={[t('admin.col.rating'), t('admin.col.count')]} />
      </AnalysisCard>
      <AnalysisCard icon={MessageSquare} title={t('admin.nav.feedback')}>
        <ul className="divide-y divide-line">
          {[...feedback].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((f) => {
            const r = readingOf(f);
            return (
              <li key={f.id} className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gold" aria-label={`${f.rating}/5`}>{'★'.repeat(f.rating)}<span className="text-muted/40">{'★'.repeat(5 - f.rating)}</span></p>
                  {f.comment && <p className="mt-1 text-sm">{f.comment}</p>}
                  <p className="mt-1 text-xs text-muted">{r ? CATEGORY_META[r.category].title[lang] : t('admin.deletedReading')} · {formatDateTime(f.createdAt, lang)}</p>
                </div>
                <button className="btn-danger px-2.5 py-1.5 text-xs" onClick={() => deleteFeedback(f.id)} aria-label={t('common.delete')}><Trash2 className="h-3.5 w-3.5" /></button>
              </li>
            );
          })}
        </ul>
      </AnalysisCard>
    </div>
  );
}

// ------------------------------------------------------------- settings ---
function AppSettingsSection() {
  const { t } = useT();
  const { settings, updateAdmin } = useSettings();
  const th = settings.admin.thresholds;
  const setTh = (k, v) => updateAdmin({ thresholds: { ...th, [k]: v } });
  const fields = [
    ['minBrightness', 0, 255, 1],
    ['maxBrightness', 0, 255, 1],
    ['minContrast', 0, 100, 1],
    ['minSharpness', 0, 200, 1],
    ['minHandArea', 0.01, 0.5, 0.01],
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AnalysisCard icon={SlidersHorizontal} title={t('admin.settings.quality')} subtitle={t('admin.settings.qualityHint')}>
        <div className="space-y-4">
          {fields.map(([k, min, max, step]) => (
            <label key={k} className="block text-sm">
              <span className="flex justify-between"><span>{t(`admin.settings.th.${k}`)}</span><span className="tabular-nums text-muted">{th[k]}</span></span>
              <input type="range" min={min} max={max} step={step} value={th[k]} onChange={(e) => setTh(k, Number(e.target.value))} className="mt-1 w-full accent-[#A78BFA]" />
            </label>
          ))}
          <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => updateAdmin({ thresholds: DEFAULT_THRESHOLDS })}><RotateCcw className="h-3.5 w-3.5" /> {t('admin.settings.resetThresholds')}</button>
        </div>
      </AnalysisCard>
      <AnalysisCard icon={SlidersHorizontal} title={t('admin.settings.general')}>
        <label className="block text-sm">
          <span className="flex justify-between"><span>{t('admin.settings.maxUpload')}</span><span className="tabular-nums text-muted">{settings.admin.maxUploadMB} MB</span></span>
          <input type="range" min="1" max="25" value={settings.admin.maxUploadMB} onChange={(e) => updateAdmin({ maxUploadMB: Number(e.target.value) })} className="mt-1 w-full accent-[#A78BFA]" />
        </label>
        <Toggle checked={settings.admin.aiEnabled} onChange={(v) => updateAdmin({ aiEnabled: v })} label={t('admin.settings.aiEnabled')} description={t('admin.settings.aiEnabledHint')} />
        <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-xs">
          <div className="flex justify-between"><dt className="text-muted">{t('admin.settings.storage')}</dt><dd>{storageBackend()}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">{t('admin.settings.ruleOverrides')}</dt><dd>{Object.keys(settings.admin.ruleOverrides || {}).length}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">{t('admin.settings.aiEndpoint')}</dt><dd>{import.meta.env.VITE_AI_API_BASE || '/api/interpret'}</dd></div>
        </dl>
      </AnalysisCard>
    </div>
  );
}

export default function AdminDashboard() {
  const { section = 'overview' } = useParams();
  const { t } = useT();
  const { data, loading } = useAdminData();
  const titles = { overview: 'admin.nav.overview', users: 'admin.nav.users', scans: 'admin.nav.scans', content: 'admin.nav.content', model: 'admin.nav.model', feedback: 'admin.nav.feedback', settings: 'admin.nav.settings' };
  const body = useMemo(() => {
    if (!data) return null;
    switch (section) {
      case 'users': return <UsersSection data={data} />;
      case 'scans': return <ScansSection data={data} />;
      case 'content': return <ContentSection />;
      case 'model': return <ModelSection data={data} />;
      case 'feedback': return <FeedbackSection data={data} />;
      case 'settings': return <AppSettingsSection />;
      default: return <Overview data={data} />;
    }
  }, [section, data]);
  return (
    <div>
      <PageHeader eyebrow={t('admin.title')} title={t(titles[section] || titles.overview)} description={t(`admin.desc.${titles[section] ? section : 'overview'}`)} />
      {loading ? <LoadingAnimation className="py-24" label={t('common.loading')} /> : body}
    </div>
  );
}

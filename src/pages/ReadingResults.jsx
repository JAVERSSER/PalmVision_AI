import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Save, Printer, ScanLine, ArrowLeft, Bot, Star, Send, CircleCheck, TriangleAlert, Eye, Lightbulb, MessageSquare, ListChecks, BookOpen, LoaderCircle, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import AnalysisCard from '../components/AnalysisCard.jsx';
import ReadingCard, { CATEGORY_ICONS } from '../components/ReadingCard.jsx';
import PalmLineOverlay from '../components/PalmLineOverlay.jsx';
import PalmSketch from '../components/PalmSketch.jsx';
import Disclaimer from '../components/Disclaimer.jsx';
import Modal from '../components/Modal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import LoadingAnimation from '../components/LoadingAnimation.jsx';
import StatusBadge, { confidenceStatus } from '../components/StatusBadge.jsx';
import { useT } from '../i18n/index.js';
import { useScan } from '../context/ScanContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { generateAllReadings, generateReading, enhanceWithLLM } from '../services/interpretationEngine.js';
import { getScanBundle, saveReadingBundle, addFeedback, updateScan, deleteScan, logEvent, listFeedback } from '../services/storageService.js';
import { canvasToDataUrl } from '../services/imageProcessing.js';
import { CATEGORIES, CATEGORY_META } from '../data/readingData.js';
import { LINE_IDS } from '../services/palmAnalysis.js';
import { formatDateTime } from '../utils/dateHelpers.js';

function compactLines(lines) {
  return Object.fromEntries(
    LINE_IDS.map((id) => [id, { points: lines[id].points, visible: lines[id].visible, confidence: lines[id].confidence, source: lines[id].source, status: lines[id].status }]),
  );
}

function FeedbackForm({ readingId, scanId, userId }) {
  const { t } = useT();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  useEffect(() => {
    setSent(false);
    setRating(0);
    setComment('');
    listFeedback().then((all) => setSent(all.some((f) => f.readingId === readingId)));
  }, [readingId]);
  if (sent) return <p className="flex items-center gap-2 text-sm text-emerald-400"><CircleCheck className="h-4 w-4" /> {t('results.feedback.thanks')}</p>;
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!rating) return;
        await addFeedback({ userId, readingId, scanId, rating, comment });
        setSent(true);
      }}
    >
      <div className="flex gap-1" role="radiogroup" aria-label={t('results.feedback.rating')}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n}`} onClick={() => setRating(n)} className="p-1">
            <Star className={`h-6 w-6 transition ${n <= rating ? 'fill-gold text-gold' : 'text-muted'}`} />
          </button>
        ))}
      </div>
      <textarea className="input min-h-20" maxLength={1000} placeholder={t('results.feedback.placeholder')} value={comment} onChange={(e) => setComment(e.target.value)} />
      <button className="btn-primary" disabled={!rating}>
        <Send className="h-4 w-4" /> {t('results.feedback.send')}
      </button>
    </form>
  );
}

export default function ReadingResults() {
  const { scanId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, lang } = useT();
  const { scan, patch } = useScan();
  const { settings, user } = useSettings();
  const isCurrent = scanId === 'current';

  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(!isCurrent);
  const [saveOpen, setSaveOpen] = useState(false);
  const [consent, setConsent] = useState(settings.saveImagesByDefault);
  const [saving, setSaving] = useState(false);
  const [ai, setAi] = useState({ status: 'idle', narratives: null, error: null });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const tab = CATEGORIES.includes(params.get('tab')) ? params.get('tab') : 'personality';

  useEffect(() => {
    if (isCurrent) return;
    setLoading(true);
    getScanBundle(scanId)
      .then((b) => setBundle(b))
      .finally(() => setLoading(false));
  }, [scanId, isCurrent]);

  // Source of truth for this page
  const source = useMemo(() => {
    if (isCurrent) {
      if (!scan.features || !scan.analysis) return null;
      return {
        features: scan.features,
        seed: scan.startedAt || 'session',
        handType: scan.handType,
        date: scan.startedAt,
        image: scan.analysis.urls.crop,
        lines: scan.lines,
        polygon: scan.analysis.region.polygon,
        narratives: scan.narratives,
      };
    }
    if (!bundle?.features) return null;
    return {
      features: bundle.features.raw,
      seed: bundle.scan.seed || bundle.scan.id,
      handType: bundle.scan.handType,
      date: bundle.scan.scanDate,
      image: bundle.scan.imageReference,
      lines: bundle.scan.lines,
      polygon: bundle.scan.polygon,
      narratives: bundle.scan.narratives,
      scan: bundle.scan,
    };
  }, [isCurrent, scan, bundle]);

  // Reports are re-generated deterministically in the current language.
  const reports = useMemo(
    () => (source ? generateAllReadings(source.features, { lang, seed: source.seed, overrides: settings.admin.ruleOverrides }) : []),
    [source, lang, settings.admin.ruleOverrides],
  );
  const report = reports.find((r) => r.category === tab);
  const narratives = ai.narratives || source?.narratives?.[lang] || null;

  if (loading) return <LoadingAnimation className="py-32" label={t('common.loading')} />;
  if (!source || !report) {
    return (
      <EmptyState
        className="mt-10"
        icon={BookOpen}
        title={isCurrent ? t('results.noCurrentTitle') : t('results.notFoundTitle')}
        body={isCurrent ? t('results.noCurrentBody') : t('results.notFoundBody')}
        action={<Link to="/scan" className="btn-primary"><ScanLine className="h-4 w-4" /> {t('dashboard.newScan')}</Link>}
      />
    );
  }

  const features = source.features;
  const savedId = isCurrent ? scan.savedScanId : scanId;

  const doSave = async () => {
    setSaving(true);
    try {
      const both = CATEGORIES.map((c) => {
        const en = generateReading(features, c, { lang: 'en', seed: source.seed, overrides: settings.admin.ruleOverrides });
        const km = generateReading(features, c, { lang: 'km', seed: source.seed, overrides: settings.admin.ruleOverrides });
        return { category: c, title: en.title, en, km };
      });
      const manual = features.manuallyAdjusted?.length > 0;
      const id = await saveReadingBundle({
        user,
        scan: {
          handType: source.handType,
          scanDate: source.date,
          source: scan.source,
          detectionStatus: manual ? 'manual' : features.detectionConfidence.overall >= 60 ? 'detected' : 'low_confidence',
          qualityScore: scan.quality?.score ?? null,
          engine: scan.analysis.processed.engine,
          lines: compactLines(scan.lines),
          polygon: scan.analysis.region.polygon,
          seed: source.seed,
          narratives: scan.narratives || null,
        },
        features,
        readings: both,
        imageDataUrl: consent ? canvasToDataUrl(scan.analysis.region.crop, 512, 0.85) : null,
        consentToStoreImage: consent,
      });
      patch({ savedScanId: id });
      logEvent('reading_saved', { withImage: consent });
      setSaveOpen(false);
      navigate(`/results/${id}?tab=${tab}`, { replace: true });
    } finally {
      setSaving(false);
    }
  };

  const doEnhance = async () => {
    setAi({ status: 'loading', narratives: null, error: null });
    const res = await enhanceWithLLM(features, reports, lang);
    logEvent('llm_request', { ok: res.ok, reason: res.ok ? null : res.reason });
    if (!res.ok) {
      setAi({ status: 'error', narratives: null, error: res.reason });
      return;
    }
    setAi({ status: 'done', narratives: res.narratives, error: null });
    const merged = { ...(source.narratives || {}), [lang]: res.narratives };
    if (isCurrent) patch({ narratives: merged });
    if (savedId) await updateScan(savedId, { narratives: merged });
  };

  const readingId = bundle?.readings?.find((r) => r.category === tab)?.id;
  const Icon = CATEGORY_ICONS[tab];
  const meta = CATEGORY_META[tab];
  const aiAvailable = settings.useAI && settings.admin.aiEnabled;

  return (
    <div className="space-y-6 print:space-y-4">
      <PageHeader
        eyebrow={t('results.eyebrow')}
        title={t('results.title')}
        description={`${t(`hand.${source.handType}Palm`)} · ${formatDateTime(source.date, lang)}`}
        actions={
          <div className="flex flex-wrap gap-2 print:hidden">
            {isCurrent && (
              <Link to="/analysis" className="btn-ghost"><ArrowLeft className="h-4 w-4" /> {t('results.backToAnalysis')}</Link>
            )}
            {isCurrent && !savedId && (
              <button className="btn-gold" onClick={() => setSaveOpen(true)}><Save className="h-4 w-4" /> {t('results.save')}</button>
            )}
            {savedId && <StatusBadge status="success">{t('results.saved')}</StatusBadge>}
            <button className="btn-ghost" onClick={() => window.print()}><Printer className="h-4 w-4" /> {t('results.print')}</button>
            {!isCurrent && (
              <button className="btn-danger" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" /> {t('common.delete')}</button>
            )}
          </div>
        }
      />

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 print:hidden" role="tablist" aria-label={t('results.categoriesLabel')}>
        {CATEGORIES.map((c) => (
          <ReadingCard key={c} category={c} compact active={c === tab} onClick={() => setParams({ tab: c }, { replace: true })} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* ---------------------------------------------------- left column */}
        <div className="space-y-4">
          <div className="card p-3">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-black">
              {source.image ? (
                <>
                  <img src={source.image} alt={t('results.palmAlt')} className="absolute inset-0 h-full w-full object-cover" />
                  <PalmLineOverlay lines={source.lines} hidden={Object.fromEntries(LINE_IDS.map((id) => [id, !meta.lines.includes(id)]))} />
                </>
              ) : (
                <PalmSketch polygon={source.polygon} lines={source.lines} />
              )}
            </div>
            {!source.image && <p className="mt-2 text-center text-[11px] text-muted">{t('results.noImageStored')}</p>}
          </div>

          <AnalysisCard icon={Eye} title={t('results.detected')} subtitle={t('results.detectedSubtitle')}>
            <ul className="space-y-3">
              {report.detectedFeatures.map((f) => (
                <li key={f.line} className="text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{f.label}</span>
                    {f.confidence != null && <StatusBadge status={confidenceStatus(f.confidence)} icon={false}>{f.visible ? `${f.confidence}%` : '—'}</StatusBadge>}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{f.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-line pt-3 text-[11px] text-muted">{t('results.overallConfidence', { c: features.detectionConfidence.overall })}</p>
          </AnalysisCard>
        </div>

        {/* --------------------------------------------------- right column */}
        <article className="space-y-4">
          <div className="card relative overflow-hidden">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl" style={{ background: `${meta.color}33` }} aria-hidden="true" />
            <div className="relative flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: `${meta.color}22`, color: meta.color }}>
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-serif text-3xl font-semibold">{report.title}</h2>
                <p className="text-sm text-muted">{report.tagline}</p>
              </div>
            </div>
            <p className="relative mt-5 text-[15px] leading-relaxed text-ink/90">{report.summary}</p>
            {report.lowConfidence && (
              <p className="relative mt-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-amber-200">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {report.lowConfidenceNote}
              </p>
            )}
          </div>

          {(aiAvailable || narratives) && (
            <AnalysisCard
              icon={Bot}
              title={t('results.ai.title')}
              subtitle={t('results.ai.subtitle')}
              action={
                aiAvailable && !narratives && (
                  <button className="btn-ghost px-3 py-1.5 text-xs print:hidden" onClick={doEnhance} disabled={ai.status === 'loading'}>
                    {ai.status === 'loading' ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />} {t('results.ai.generate')}
                  </button>
                )
              }
            >
              {narratives?.[tab] ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink/90">{narratives[tab]}</p>
              ) : ai.status === 'error' ? (
                <p className="text-sm text-amber-300">{t('results.ai.unavailable', { reason: ai.error })}</p>
              ) : (
                <p className="text-sm text-muted">{t('results.ai.idle')}</p>
              )}
            </AnalysisCard>
          )}

          <AnalysisCard icon={BookOpen} title={t('results.interpretation')} subtitle={t('results.interpretationSubtitle')}>
            {report.details.length === 0 ? (
              <p className="text-sm text-muted">{t('results.noDetails')}</p>
            ) : (
              <div className="space-y-4">
                {report.details.map((d) => (
                  <section key={d.id}>
                    <h3 className="font-semibold text-ink">{d.heading}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{d.text}</p>
                  </section>
                ))}
              </div>
            )}
          </AnalysisCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <AnalysisCard icon={ListChecks} title={t('results.observations')}>
              <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted marker:text-gold">
                {report.observations.map((o) => <li key={o}>{o}</li>)}
              </ul>
            </AnalysisCard>
            <AnalysisCard icon={Lightbulb} title={t('results.reflections')}>
              <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed text-muted marker:text-gold">
                {report.reflections.map((q) => <li key={q}>{q}</li>)}
              </ol>
            </AnalysisCard>
          </div>

          <Disclaimer />

          <AnalysisCard icon={MessageSquare} title={t('results.feedback.title')} className="print:hidden">
            {readingId ? (
              <FeedbackForm readingId={readingId} scanId={savedId} userId={user?.id} />
            ) : (
              <p className="text-sm text-muted">{t('results.feedback.saveFirst')}</p>
            )}
          </AnalysisCard>
        </article>
      </div>

      <Modal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title={t('results.saveTitle')}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setSaveOpen(false)}>{t('common.cancel')}</button>
            <button className="btn-gold" onClick={doSave} disabled={saving}>
              {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t('results.save')}
            </button>
          </>
        }
      >
        <p>{t('results.saveBody')}</p>
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3">
          <input type="checkbox" className="mt-1 h-4 w-4 accent-[#A78BFA]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            <span className="block font-medium text-ink">{t('results.consentLabel')}</span>
            <span className="text-xs">{t('results.consentHelp')}</span>
          </span>
        </label>
      </Modal>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('history.deleteTitle')}
        size="sm"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setConfirmDelete(false)}>{t('common.cancel')}</button>
            <button
              className="btn-danger"
              onClick={async () => {
                await deleteScan(scanId);
                navigate('/history');
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

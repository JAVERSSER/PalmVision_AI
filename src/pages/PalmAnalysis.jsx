import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ScanLine, ZoomIn, ZoomOut, Maximize2, Eye, EyeOff, Move, Pencil, RotateCcw, Ban, Check, Wand2, Layers, Gauge, Cpu, ArrowRight, TriangleAlert, Columns2, Info,
} from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import AnalysisCard from '../components/AnalysisCard.jsx';
import PalmLineOverlay from '../components/PalmLineOverlay.jsx';
import HandLandmarks from '../components/HandLandmarks.jsx';
import ImageCompare from '../components/ImageCompare.jsx';
import LoadingAnimation from '../components/LoadingAnimation.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ConfidenceMeter from '../components/ConfidenceMeter.jsx';
import StatusBadge, { confidenceStatus } from '../components/StatusBadge.jsx';
import ScanStepper from '../components/ScanStepper.jsx';
import { useT } from '../i18n/index.js';
import { useScan } from '../context/ScanContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { extractPalmRegion, processPalm, applyAffine, CANON_SIZE } from '../services/imageProcessing.js';
import { detectPalmLines, measureLine, extractFeatures, LINE_COLORS, LINE_IDS } from '../services/palmAnalysis.js';
import { generateAllReadings } from '../services/interpretationEngine.js';
import { logEvent } from '../services/storageService.js';
import { LINE_NAMES, LINE_DESCRIPTIONS } from '../data/readingData.js';
import { catmullRom } from '../utils/curves.js';

const VIEWS = ['original', 'crop', 'gray', 'enhanced', 'crease', 'edges', 'compare'];

function lineStatus(line) {
  if (!line.visible) return { key: 'analysis.status.hidden', status: 'error' };
  if (line.source === 'manual') return { key: 'analysis.status.manual', status: 'info' };
  if (line.status === 'detected') return { key: 'analysis.status.detected', status: 'success' };
  if (line.status === 'weak') return { key: 'analysis.status.weak', status: 'warning' };
  return { key: 'analysis.status.none', status: 'error' };
}

export default function PalmAnalysis() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { scan, patch, updateLine } = useScan();
  const { settings } = useSettings();
  const [stage, setStage] = useState(null); // extract | enhance | trace | done | error
  const [error, setError] = useState(null);
  const [view, setView] = useState('crop');
  const [hidden, setHidden] = useState({});
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('view'); // view | adjust | draw
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef(null);
  const ran = useRef(false);

  // ------------------------------------------------------------ pipeline
  useEffect(() => {
    if (!scan.image || scan.analysis || ran.current) {
      if (scan.analysis) setStage('done');
      return;
    }
    ran.current = true;
    (async () => {
      const t0 = performance.now();
      try {
        setStage('extract');
        await new Promise((r) => setTimeout(r, 30));
        const region = extractPalmRegion(scan.image.canvas, scan.hand.landmarks);
        setStage('enhance');
        const processed = await processPalm(region.crop, region.mask);
        setStage('trace');
        await new Promise((r) => setTimeout(r, 30));
        const { lines, durationMs: traceMs } = detectPalmLines(processed.creaseMap, CANON_SIZE);
        for (const id of LINE_IDS) Object.assign(lines[id], { autoConfidence: lines[id].confidence, autoStatus: lines[id].status, autoVisible: lines[id].visible });
        const urls = {
          crop: region.crop.toDataURL('image/jpeg', 0.9),
          gray: processed.gray.toDataURL('image/jpeg', 0.9),
          enhanced: processed.enhanced.toDataURL('image/jpeg', 0.9),
          crease: processed.crease.toDataURL('image/jpeg', 0.9),
          edges: processed.edges ? processed.edges.toDataURL('image/png') : null,
        };
        const totalMs = Math.round(performance.now() - t0);
        patch({ analysis: { region, processed, urls, timings: { processMs: Math.round(processed.durationMs), traceMs: Math.round(traceMs), totalMs } }, lines });
        setStage('done');
        logEvent('analysis', {
          status: 'ok',
          handType: scan.handType,
          source: scan.source,
          engine: processed.engine,
          fallbackReason: processed.fallbackReason || null,
          totalMs,
          landmarkScore: scan.hand.handednessScore,
          qualityScore: scan.quality?.score,
          lineConfidence: Object.fromEntries(LINE_IDS.map((id) => [id, lines[id].confidence])),
          lineStatus: Object.fromEntries(LINE_IDS.map((id) => [id, lines[id].status])),
        });
      } catch (err) {
        console.error(err);
        setError(String(err?.message || err));
        setStage('error');
        logEvent('analysis', { status: 'error', error: String(err?.message || err) });
      }
    })();
  }, [scan.image, scan.analysis, scan.hand, scan.handType, scan.source, scan.quality, patch]);

  const a = scan.analysis;
  const lines = scan.lines;

  // ---------------------------------------------------------- line edits
  const onLineChange = (id, points, extra = {}) => {
    const measured = measureLine(a.processed.creaseMap, CANON_SIZE, points, lines[id].stats);
    updateLine(id, { points, source: 'manual', visible: true, status: 'manual', confidence: measured.confidence, contrast: measured.contrast, breaks: 0, drawing: !!extra.drawing });
  };
  const resetLine = (id) =>
    updateLine(id, { points: lines[id].autoPoints, source: 'auto', visible: lines[id].autoVisible, status: lines[id].autoStatus, confidence: lines[id].autoConfidence, drawing: false });
  const toggleLineVisible = (id) => updateLine(id, lines[id].visible ? { visible: false, source: 'manual' } : { visible: true, source: 'manual', status: 'manual' });
  const startDraw = (id) => {
    setSelected(id);
    setMode('draw');
    updateLine(id, { points: [], drawing: true, source: 'manual', visible: true, status: 'manual' });
  };
  const finishEditing = () => {
    if (selected && lines[selected]?.drawing) {
      if (lines[selected].points.length < 2) resetLine(selected);
      else updateLine(selected, { drawing: false });
    }
    if (selected) logEvent('line_corrected', { line: selected, mode });
    setMode('view');
  };

  // ------------------------------------------------------------- zoom/pan
  const setZoomClamped = (z) => {
    const nz = Math.max(1, Math.min(4, z));
    setZoom(nz);
    if (nz === 1) setPan({ x: 0, y: 0 });
  };
  const panHandlers = {
    onPointerDown: (e) => {
      if (mode !== 'view' || zoom === 1) return;
      panRef.current = { x: e.clientX, y: e.clientY, pan };
    },
    onPointerMove: (e) => {
      if (!panRef.current) return;
      setPan({ x: panRef.current.pan.x + (e.clientX - panRef.current.x), y: panRef.current.pan.y + (e.clientY - panRef.current.y) });
    },
    onPointerUp: () => (panRef.current = null),
    onPointerLeave: () => (panRef.current = null),
    onWheel: (e) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoomClamped(zoom - e.deltaY * 0.002);
    },
  };

  // Lines mapped back onto the original photo (for the "original" view)
  const originalPaths = useMemo(() => {
    if (!a || !lines) return [];
    const { inverse } = a.region;
    const W = scan.image.width, H = scan.image.height;
    return LINE_IDS.filter((id) => lines[id].visible && !hidden[id] && lines[id].points.length > 1).map((id) => ({
      id,
      d: catmullRom(lines[id].points, 10)
        .map(([x, y], i) => {
          const [px, py] = applyAffine(inverse, [x * CANON_SIZE, y * CANON_SIZE]);
          return `${i ? 'L' : 'M'}${((px / W) * 1000).toFixed(1)} ${((py / H) * 1000).toFixed(1)}`;
        })
        .join(' '),
    }));
  }, [a, lines, hidden, scan.image]);

  const generate = () => {
    finishEditing();
    const features = extractFeatures({
      lines,
      hand: scan.hand,
      handType: scan.handType,
      canonLandmarks: a.region.canonLandmarks,
      quality: scan.quality,
      imageSize: { w: scan.image.width, h: scan.image.height },
    });
    const seed = scan.startedAt || 'session';
    const readings = generateAllReadings(features, { lang, seed, overrides: settings.admin.ruleOverrides });
    patch({ features, readings, narratives: null, savedScanId: null });
    logEvent('reading_generated', {
      manualLines: features.manuallyAdjusted,
      overall: features.detectionConfidence.overall,
      lineConfidence: features.detectionConfidence.lines,
      element: features.palmShape.element,
    });
    navigate('/results/current');
  };

  // ----------------------------------------------------------------- render
  if (!scan.image) {
    return (
      <EmptyState
        icon={ScanLine}
        title={t('analysis.noScanTitle')}
        body={t('analysis.noScanBody')}
        action={<Link to="/scan" className="btn-primary"><ScanLine className="h-4 w-4" /> {t('dashboard.newScan')}</Link>}
        className="mt-10"
      />
    );
  }

  if (stage !== 'done' || !a || !lines) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow={t('analysis.eyebrow')} title={t('analysis.title')} />
        <ScanStepper current="processing" />
        <div className="card py-16">
          {stage === 'error' ? (
            <div className="text-center" role="alert">
              <TriangleAlert className="mx-auto h-10 w-10 text-red-400" />
              <p className="mt-3 font-semibold">{t('analysis.errorTitle')}</p>
              <p className="mt-1 text-sm text-muted">{error}</p>
              <Link to="/scan" className="btn-ghost mt-5">{t('scanner.review.retake')}</Link>
            </div>
          ) : (
            <LoadingAnimation label={t(`analysis.stage.${stage || 'extract'}`)} sublabel={t('analysis.stageHint')} />
          )}
        </div>
      </div>
    );
  }

  const canonicalView = ['crop', 'gray', 'enhanced', 'crease', 'edges'].includes(view);
  const viewSrc = view === 'original' ? scan.image.url : a.urls[view];
  const sel = selected ? lines[selected] : null;
  const conf = {
    landmarks: Math.round(scan.hand.handednessScore * 100),
    quality: scan.quality?.score ?? 0,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={t('analysis.eyebrow')}
        title={t('analysis.title')}
        description={t('analysis.subtitle')}
        actions={
          <button className="btn-gold" onClick={generate} disabled={mode !== 'view' && sel?.drawing && sel.points.length < 2}>
            <Wand2 className="h-4 w-4" /> {t('analysis.generate')}
          </button>
        }
      />
      <ScanStepper current="complete" />

      {a.processed.engine !== 'opencv' && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-sm text-amber-200">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {t('analysis.fallbackNotice')}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* --------------------------------------------------------- viewer */}
        <div className="min-w-0 space-y-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label={t('analysis.viewsLabel')}>
            {VIEWS.filter((v) => v !== 'edges' || a.urls.edges).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => {
                  setView(v);
                  if (!['crop', 'gray', 'enhanced', 'crease', 'edges'].includes(v)) setMode('view');
                }}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${view === v ? 'bg-primary text-white' : 'border border-line text-muted hover:text-ink'}`}
              >
                {v === 'compare' && <Columns2 className="mr-1 inline h-3.5 w-3.5" />}
                {t(`analysis.views.${v}`)}
              </button>
            ))}
          </div>

          {view === 'compare' ? (
            <ImageCompare before={a.urls.crop} after={a.urls.crease} beforeLabel={t('analysis.views.crop')} afterLabel={t('analysis.views.crease')} />
          ) : (
            <div className="relative">
              <div
                className={`relative w-full overflow-hidden rounded-2xl border border-line bg-black ${zoom > 1 && mode === 'view' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                style={{ aspectRatio: view === 'original' ? `${scan.image.width} / ${scan.image.height}` : '1 / 1', touchAction: zoom > 1 ? 'none' : 'auto' }}
                {...panHandlers}
              >
                <div className="absolute inset-0 origin-center transition-transform duration-75" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
                  <img src={viewSrc} alt={t(`analysis.views.${view}`)} className="absolute inset-0 h-full w-full object-contain" draggable="false" />
                  {view === 'original' && (
                    <>
                      {settings.showLandmarks && <HandLandmarks landmarks={scan.hand.landmarks} color="rgba(167,139,250,.8)" />}
                      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
                        {originalPaths.map((p) => (
                          <path key={p.id} d={p.d} fill="none" stroke={LINE_COLORS[p.id]} strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 4 }} />
                        ))}
                      </svg>
                    </>
                  )}
                  {canonicalView && (
                    <PalmLineOverlay
                      lines={lines}
                      hidden={hidden}
                      selected={selected}
                      onSelect={setSelected}
                      mode={mode}
                      onChange={onLineChange}
                      labels={Object.fromEntries(LINE_IDS.map((id) => [id, LINE_NAMES[id][lang]]))}
                    />
                  )}
                </div>
              </div>
              <div className="absolute bottom-3 right-3 flex gap-1.5">
                <button className="btn-ghost bg-bg/80 p-2" onClick={() => setZoomClamped(zoom + 0.5)} aria-label={t('analysis.zoomIn')}><ZoomIn className="h-4 w-4" /></button>
                <button className="btn-ghost bg-bg/80 p-2" onClick={() => setZoomClamped(zoom - 0.5)} aria-label={t('analysis.zoomOut')}><ZoomOut className="h-4 w-4" /></button>
                <button className="btn-ghost bg-bg/80 p-2" onClick={() => setZoomClamped(1)} aria-label={t('analysis.zoomReset')}><Maximize2 className="h-4 w-4" /></button>
              </div>
              {zoom > 1 && <span className="absolute left-3 top-3 chip bg-bg/80 text-muted"><Move className="h-3.5 w-3.5" /> {Math.round(zoom * 100)}%</span>}
              {mode !== 'view' && (
                <div className="absolute inset-x-3 top-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-bg/90 px-3 py-2 text-xs">
                  <span className="text-ink">{t(mode === 'draw' ? 'analysis.edit.drawHint' : 'analysis.edit.adjustHint', { line: LINE_NAMES[selected][lang] })}</span>
                  <button className="btn-primary px-3 py-1.5 text-xs" onClick={finishEditing}><Check className="h-3.5 w-3.5" /> {t('analysis.edit.done')}</button>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-muted">{view === 'original' ? t('analysis.originalNote') : view === 'compare' ? t('analysis.compareNote') : t('analysis.canonicalNote')}</p>

          <AnalysisCard icon={Layers} title={t('analysis.pipelineTitle')} subtitle={t('analysis.pipelineSubtitle', { engine: a.processed.engine === 'opencv' ? 'OpenCV.js' : t('analysis.jsEngine'), ms: a.timings.totalMs })}>
            <ol className="grid gap-2 text-sm sm:grid-cols-2">
              {['landmarks', 'extract', ...a.processed.steps, 'trace'].map((s, i) => (
                <li key={`${s}-${i}`} className="flex items-start gap-2 rounded-xl bg-white/[0.03] px-3 py-2">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/20 text-[10px] text-primary">{i + 1}</span>
                  <span className="text-muted">{t(`analysis.steps.${s}`)}</span>
                </li>
              ))}
            </ol>
          </AnalysisCard>
        </div>

        {/* ---------------------------------------------------------- panel */}
        <aside className="space-y-4">
          <AnalysisCard icon={Eye} title={t('analysis.linesTitle')} subtitle={t('analysis.linesSubtitle')}>
            <ul className="space-y-2">
              {LINE_IDS.map((id) => {
                const l = lines[id];
                const st = lineStatus(l);
                return (
                  <li key={id}>
                    <div className={`flex items-center gap-2 rounded-xl border p-2.5 transition ${selected === id ? 'border-primary/60 bg-primary/10' : 'border-line'}`}>
                      <button className="flex min-w-0 flex-1 items-center gap-2.5 text-left" onClick={() => setSelected(selected === id ? null : id)} aria-pressed={selected === id}>
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: LINE_COLORS[id], boxShadow: `0 0 10px ${LINE_COLORS[id]}` }} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{LINE_NAMES[id][lang]}</span>
                          <span className="block text-[11px] text-muted">{l.visible ? t('analysis.confidenceShort', { c: l.confidence }) : t('analysis.status.hidden')}</span>
                        </span>
                      </button>
                      <StatusBadge status={st.status} icon={false}>{t(st.key)}</StatusBadge>
                      <button className="rounded-lg p-1.5 text-muted hover:bg-white/10 hover:text-ink" onClick={() => setHidden((h) => ({ ...h, [id]: !h[id] }))} aria-label={t(hidden[id] ? 'analysis.show' : 'analysis.hide', { line: LINE_NAMES[id][lang] })}>
                        {hidden[id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {sel && (
              <div className="mt-4 space-y-3 rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs leading-relaxed text-muted">{LINE_DESCRIPTIONS[selected][lang]}</p>
                {sel.visible && <ConfidenceMeter value={sel.confidence} label={sel.source === 'manual' ? t('analysis.measuredAlong') : t('analysis.visualConfidence')} />}
                <dl className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-white/[0.03] p-2"><dt className="text-muted">{t('analysis.metric.contrast')}</dt><dd className="font-semibold">{sel.contrast ?? '—'}σ</dd></div>
                  <div className="rounded-lg bg-white/[0.03] p-2"><dt className="text-muted">{t('analysis.metric.coverage')}</dt><dd className="font-semibold">{sel.source === 'auto' ? `${Math.round((sel.coverage || 0) * 100)}%` : '—'}</dd></div>
                  <div className="rounded-lg bg-white/[0.03] p-2"><dt className="text-muted">{t('analysis.metric.breaks')}</dt><dd className="font-semibold">{sel.source === 'auto' ? sel.breaks : '—'}</dd></div>
                </dl>
                {!canonicalView && <p className="text-[11px] text-amber-300">{t('analysis.edit.switchView')}</p>}
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn-ghost px-3 py-2 text-xs" disabled={!canonicalView || !sel.visible || sel.points.length < 2} onClick={() => setMode(mode === 'adjust' ? 'view' : 'adjust')}>
                    <Move className="h-3.5 w-3.5" /> {t('analysis.edit.adjust')}
                  </button>
                  <button className="btn-ghost px-3 py-2 text-xs" disabled={!canonicalView} onClick={() => startDraw(selected)}>
                    <Pencil className="h-3.5 w-3.5" /> {t('analysis.edit.redraw')}
                  </button>
                  <button className="btn-ghost px-3 py-2 text-xs" onClick={() => toggleLineVisible(selected)}>
                    <Ban className="h-3.5 w-3.5" /> {sel.visible ? t('analysis.edit.markAbsent') : t('analysis.edit.markPresent')}
                  </button>
                  <button className="btn-ghost px-3 py-2 text-xs" disabled={sel.source === 'auto'} onClick={() => resetLine(selected)}>
                    <RotateCcw className="h-3.5 w-3.5" /> {t('analysis.edit.reset')}
                  </button>
                </div>
              </div>
            )}
            {!sel && <p className="mt-3 flex items-start gap-2 text-xs text-muted"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t('analysis.selectHint')}</p>}
          </AnalysisCard>

          <AnalysisCard icon={Gauge} title={t('analysis.confidenceTitle')} subtitle={t('analysis.confidenceSubtitle')}>
            <div className="space-y-3">
              <ConfidenceMeter value={conf.landmarks} label={t('analysis.conf.landmarks')} />
              <ConfidenceMeter value={conf.quality} label={t('analysis.conf.quality')} />
              {LINE_IDS.map((id) => (
                <ConfidenceMeter key={id} value={lines[id].visible ? lines[id].confidence : 0} label={LINE_NAMES[id][lang]} color={LINE_COLORS[id]} />
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-muted">{t('analysis.confidenceNote')}</p>
          </AnalysisCard>

          <AnalysisCard icon={Cpu} title={t('analysis.techTitle')}>
            <dl className="space-y-1.5 text-xs">
              {[
                [t('analysis.tech.engine'), a.processed.engine === 'opencv' ? 'OpenCV.js 4.10' : t('analysis.jsEngine')],
                [t('analysis.tech.detector'), 'MediaPipe Hand Landmarker'],
                [t('analysis.tech.hand'), `${t(`hand.${scan.handType}`)} (${t('analysis.tech.model')}: ${t(`hand.${scan.hand.handedness}`)})`],
                [t('analysis.tech.size'), `${scan.image.width}×${scan.image.height} → ${CANON_SIZE}×${CANON_SIZE}`],
                [t('analysis.tech.time'), `${a.timings.processMs} + ${a.timings.traceMs} ms`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </AnalysisCard>

          <button className="btn-gold w-full" onClick={generate}>
            {t('analysis.generate')} <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </div>
    </div>
  );
}

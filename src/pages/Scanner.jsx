import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ImageUp, RotateCcw, ArrowRight, CircleCheck, TriangleAlert, CircleAlert, Hand, Lightbulb, LoaderCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import CameraScanner from '../components/CameraScanner.jsx';
import ImageUploader from '../components/ImageUploader.jsx';
import HandLandmarks from '../components/HandLandmarks.jsx';
import ScanStepper from '../components/ScanStepper.jsx';
import AnalysisCard from '../components/AnalysisCard.jsx';
import Disclaimer from '../components/Disclaimer.jsx';
import LoadingAnimation from '../components/LoadingAnimation.jsx';
import { useT } from '../i18n/index.js';
import { useScan } from '../context/ScanContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { detectHandsInImage, pickPrimaryHand } from '../services/handDetection.js';
import { assessQuality, computeRegionStats, fileToCanvas, landmarkBBox, isPalmFacing, handRotation } from '../utils/imageValidation.js';
import { logEvent } from '../services/storageService.js';

const CHECK_ICON = { pass: CircleCheck, warn: TriangleAlert, fail: CircleAlert };
const CHECK_COLOR = { pass: 'text-emerald-400', warn: 'text-amber-400', fail: 'text-red-400' };

export default function Scanner() {
  const { t } = useT();
  const navigate = useNavigate();
  const { reset, patch } = useScan();
  const { settings, user } = useSettings();
  const [handType, setHandType] = useState(user?.dominantHand || 'right');
  useEffect(() => {
    if (user?.dominantHand) setHandType(user.dominantHand);
  }, [user?.dominantHand]);
  const [mode, setMode] = useState('camera');
  const [liveState, setLiveState] = useState('waiting');
  const [review, setReview] = useState(null); // { canvas, url, detection, hand, quality, status, error }

  const onLiveState = useCallback((s) => setLiveState((prev) => (prev === s ? prev : s)), []);

  const analyseStill = async (canvas, source) => {
    const url = canvas.toDataURL('image/jpeg', 0.92);
    setReview({ canvas, url, source, status: 'checking' });
    try {
      const detection = await detectHandsInImage(canvas);
      const hand = pickPrimaryHand(detection.hands, handType);
      const stats = hand ? computeRegionStats(canvas, landmarkBBox(hand.landmarks)) : null;
      const quality = assessQuality({ detection, hand, selectedHand: handType, stats, thresholds: settings.admin.thresholds });
      setReview({ canvas, url, source, detection, hand, stats, quality, status: 'done' });
      logEvent('detection', {
        source,
        handType,
        status: !hand ? 'no_hand' : quality.blocking ? 'rejected' : 'accepted',
        reasons: quality.checks.filter((c) => c.status !== 'pass').map((c) => c.id),
        landmarkScore: hand?.handednessScore ?? null,
        qualityScore: quality.score,
        durationMs: Math.round(detection.durationMs),
      });
    } catch (err) {
      console.error(err);
      setReview({ canvas, url, source, status: 'error', error: String(err?.message || err) });
      logEvent('detection', { source, handType, status: 'error', error: String(err?.message || err) });
    }
  };

  const onFile = async (file) => {
    try {
      const canvas = await fileToCanvas(file);
      await analyseStill(canvas, 'upload');
    } catch (err) {
      setReview({ status: 'error', error: t(err.message) });
    }
  };

  const retake = () => {
    setReview(null);
    setLiveState('waiting');
  };

  const confirm = () => {
    reset({ handType });
    patch({
      handType,
      source: review.source,
      image: { canvas: review.canvas, url: review.url, width: review.canvas.width, height: review.canvas.height },
      detection: review.detection,
      hand: review.hand,
      quality: review.quality,
      startedAt: new Date().toISOString(),
    });
    navigate('/analysis');
  };

  const stepperState = review ? (review.status === 'checking' ? 'quality' : review.hand ? 'quality' : 'waiting') : mode === 'camera' ? liveState : 'waiting';

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={t('scanner.eyebrow')} title={t('scanner.title')} description={t('scanner.subtitle')} />
      <ScanStepper current={stepperState} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          {!review && (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-xl border border-line p-1" role="tablist" aria-label={t('scanner.modeLabel')}>
                  {[
                    ['camera', Camera, t('scanner.modeCamera')],
                    ['upload', ImageUp, t('scanner.modeUpload')],
                  ].map(([m, Icon, label]) => (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => setMode(m)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${mode === m ? 'bg-primary text-white' : 'text-muted hover:text-ink'}`}
                    >
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  ))}
                </div>
              </div>
              {mode === 'camera' ? <CameraScanner handType={handType} onCapture={(c) => analyseStill(c, 'camera')} onState={onLiveState} /> : <ImageUploader onFile={onFile} />}
            </>
          )}

          {review && (
            <AnalysisCard icon={Hand} title={t('scanner.review.title')} subtitle={t('scanner.review.subtitle')}>
              {review.status === 'error' && !review.canvas ? (
                <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300" role="alert">{review.error}</div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
                  <div className="relative overflow-hidden rounded-2xl border border-line bg-black" style={{ aspectRatio: `${review.canvas.width} / ${review.canvas.height}` }}>
                    <img src={review.url} alt={t('scanner.review.imageAlt')} className="absolute inset-0 h-full w-full object-contain" />
                    {review.hand && <HandLandmarks landmarks={review.hand.landmarks} color={review.quality?.blocking ? '#f87171' : '#34d399'} />}
                    {review.status === 'checking' && (
                      <div className="absolute inset-0 grid place-items-center bg-bg/70">
                        <LoadingAnimation label={t('scanner.review.checking')} size={72} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {review.status === 'error' && <p className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">{t('scanner.review.error')}</p>}
                    {review.status === 'done' && !review.hand && (
                      <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4" role="alert">
                        <p className="font-semibold text-red-300">{t('quality.noHand')}</p>
                        <p className="mt-1 text-sm text-muted">{t('scanner.review.noHandHelp')}</p>
                      </div>
                    )}
                    {review.status === 'done' && review.hand && (
                      <>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          <div className="rounded-xl bg-white/[0.03] p-3">
                            <dt className="text-xs text-muted">{t('scanner.review.detectedHand')}</dt>
                            <dd className="font-semibold">{t(`hand.${review.hand.handedness}`)} · {Math.round(review.hand.handednessScore * 100)}%</dd>
                          </div>
                          <div className="rounded-xl bg-white/[0.03] p-3">
                            <dt className="text-xs text-muted">{t('scanner.review.orientation')}</dt>
                            <dd className="font-semibold">
                              {isPalmFacing(review.hand.landmarks, handType) ? t('scanner.review.palmSide') : t('scanner.review.backSide')} · {Math.round(handRotation(review.hand.landmarks))}°
                            </dd>
                          </div>
                          <div className="rounded-xl bg-white/[0.03] p-3">
                            <dt className="text-xs text-muted">{t('scanner.review.landmarks')}</dt>
                            <dd className="font-semibold">21 / 21</dd>
                          </div>
                          <div className="rounded-xl bg-white/[0.03] p-3">
                            <dt className="text-xs text-muted">{t('scanner.review.quality')}</dt>
                            <dd className="font-semibold">{review.quality.blocking ? t('scanner.review.rejected') : `${review.quality.score}/100`}</dd>
                          </div>
                        </dl>
                      </>
                    )}
                    {review.quality && (
                      <ul className="space-y-1.5" aria-label={t('scanner.review.checks')}>
                        {review.quality.checks.map((c) => {
                          const Icon = CHECK_ICON[c.status];
                          return (
                            <li key={c.id} className="flex items-start gap-2 text-sm">
                              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${CHECK_COLOR[c.status]}`} aria-label={c.status} />
                              <span className={c.status === 'pass' ? 'text-muted' : 'text-ink'}>{t(c.key, { ...c.vars, detected: c.vars?.detected ? t(`hand.${c.vars.detected}`) : undefined })}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button className="btn-ghost" onClick={retake}>
                        <RotateCcw className="h-4 w-4" /> {t('scanner.review.retake')}
                      </button>
                      <button className="btn-gold flex-1" onClick={confirm} disabled={review.status !== 'done' || !review.hand || review.quality?.blocking}>
                        {review.status === 'checking' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                        {review.quality?.checks.some((c) => c.status === 'warn') && !review.quality.blocking ? t('scanner.review.confirmAnyway') : t('scanner.review.confirm')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {review.status === 'error' && !review.canvas && (
                <button className="btn-ghost mt-4" onClick={retake}>
                  <RotateCcw className="h-4 w-4" /> {t('scanner.review.retake')}
                </button>
              )}
            </AnalysisCard>
          )}
        </div>

        <aside className="space-y-4">
          <AnalysisCard icon={Hand} title={t('scanner.handTitle')} subtitle={t('scanner.handSubtitle')}>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('scanner.handTitle')}>
              {['left', 'right'].map((h) => (
                <button
                  key={h}
                  role="radio"
                  aria-checked={handType === h}
                  disabled={!!review}
                  onClick={() => setHandType(h)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition disabled:opacity-60 ${handType === h ? 'border-gold/60 bg-gold/10 text-ink' : 'border-line text-muted hover:border-primary/40'}`}
                >
                  <Hand className={`h-7 w-7 ${h === 'left' ? '-scale-x-100' : ''}`} aria-hidden="true" />
                  {t(`hand.${h}`)}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">{t('scanner.handNote')}</p>
          </AnalysisCard>
          <AnalysisCard icon={Lightbulb} title={t('scanner.tipsTitle')}>
            <ol className="list-decimal space-y-2 pl-4 text-sm text-muted marker:text-gold">
              {['light', 'flat', 'fill', 'steady', 'background', 'palmUp'].map((k) => (
                <li key={k}>{t(`scanner.tips.${k}`)}</li>
              ))}
            </ol>
          </AnalysisCard>
          <Disclaimer variant="inline" />
          <p className="text-xs leading-relaxed text-muted">{t('scanner.privacyNote')}</p>
        </aside>
      </div>
    </div>
  );
}

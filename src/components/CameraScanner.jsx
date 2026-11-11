import { useEffect, useRef } from 'react';
import { Camera, SwitchCamera, CameraOff, LoaderCircle } from 'lucide-react';
import { useCamera } from '../hooks/useCamera.js';
import { useHandLandmarker } from '../hooks/useHandLandmarker.js';
import { useT } from '../i18n/index.js';
import { useSettings } from '../context/SettingsContext.jsx';
import HandLandmarks from './HandLandmarks.jsx';
import { drawScaled } from '../utils/imageValidation.js';

const STABLE_FRAMES = 12;

/**
 * Live webcam view with real-time MediaPipe landmarks.
 * Reports its scanning state via onState and returns an un-mirrored still via onCapture.
 */
export default function CameraScanner({ handType, onCapture, onState }) {
  const { t } = useT();
  const { settings } = useSettings();
  const cam = useCamera();
  const tracking = useHandLandmarker(cam.videoRef, { active: cam.status === 'active', preferredHand: handType });
  const autoRef = useRef(false);

  useEffect(() => {
    cam.start();
    return () => cam.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stable = tracking.hand && tracking.stableFrames >= STABLE_FRAMES;
  const state = !tracking.hand ? 'waiting' : stable ? 'detected' : 'detecting';
  useEffect(() => onState?.(state, tracking), [state, tracking, onState]);

  const capture = () => {
    const video = cam.videoRef.current;
    if (!video?.videoWidth) return;
    // The still is taken from the raw (un-mirrored) camera frame.
    const canvas = drawScaled(video, video.videoWidth, video.videoHeight);
    onCapture(canvas);
  };

  // Optional hands-free capture once the hand has been steady for ~1.5 s.
  useEffect(() => {
    if (!settings.autoCapture || autoRef.current) return;
    if (tracking.hand && tracking.stableFrames >= STABLE_FRAMES * 3) {
      autoRef.current = true;
      capture();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.autoCapture, tracking.stableFrames, tracking.hand]);

  const aspect = tracking.width && tracking.height ? `${tracking.width} / ${tracking.height}` : '16 / 9';
  const mirror = cam.mirrored ? '-scale-x-100' : '';

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-black" style={{ aspectRatio: aspect }}>
        <div className={`absolute inset-0 ${mirror}`}>
          <video ref={cam.videoRef} className="h-full w-full object-contain" playsInline muted aria-label={t('camera.videoLabel')} />
          {settings.showLandmarks && tracking.hand && <HandLandmarks landmarks={tracking.hand.landmarks} color={stable ? '#34d399' : '#A78BFA'} />}
        </div>

        {/* positioning guide */}
        {cam.status === 'active' && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
            <div className={`relative h-[82%] aspect-[3/4] rounded-[40%_40%_30%_30%] border-2 border-dashed transition-colors ${stable ? 'border-emerald-400/80' : 'border-white/30'}`}>
              <div className="absolute inset-x-0 top-0 h-full overflow-hidden rounded-[inherit]">
                <div className="scan-beam h-16 bg-gradient-to-b from-transparent to-primary/40" />
              </div>
            </div>
          </div>
        )}

        {cam.status === 'requesting' && (
          <div className="absolute inset-0 grid place-items-center bg-bg/80 text-center text-sm text-muted">
            <div>
              <LoaderCircle className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
              {t('camera.requesting')}
            </div>
          </div>
        )}
        {cam.status === 'error' && (
          <div className="absolute inset-0 grid place-items-center bg-bg/90 p-6 text-center" role="alert">
            <div className="max-w-sm">
              <CameraOff className="mx-auto mb-3 h-10 w-10 text-red-400" />
              <p className="font-semibold text-ink">{t('camera.errorTitle')}</p>
              <p className="mt-1 text-sm text-muted">{t(cam.error)}</p>
              <button className="btn-ghost mt-4" onClick={() => cam.start()}>
                {t('common.tryAgain')}
              </button>
            </div>
          </div>
        )}
        {cam.status === 'active' && tracking.modelStatus !== 'ready' && (
          <div className="absolute left-3 top-3 chip bg-bg/80 text-muted">
            {tracking.modelStatus === 'error' ? t('camera.modelError') : (
              <>
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> {t('camera.loadingModel')}
              </>
            )}
          </div>
        )}
        {cam.status === 'active' && tracking.modelStatus === 'ready' && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className={`chip bg-bg/80 ${tracking.hand ? (stable ? 'text-emerald-300' : 'text-primary') : 'text-muted'}`}>
              {t(`scanner.steps.${state}`)}
            </span>
            {tracking.hand && (
              <span className="chip bg-bg/80 text-muted">
                {t(`hand.${tracking.hand.handedness}`)} · {Math.round(tracking.hand.handednessScore * 100)}%
              </span>
            )}
            {tracking.handsCount > 1 && <span className="chip bg-bg/80 text-amber-300">{t('quality.multipleHands')}</span>}
          </div>
        )}
        {cam.status === 'active' && tracking.fps > 0 && <span className="absolute bottom-3 right-3 chip bg-bg/80 text-[10px] text-muted">{tracking.fps} fps</span>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-gold flex-1 sm:flex-none" onClick={capture} disabled={cam.status !== 'active'}>
          <Camera className="h-4 w-4" /> {t('camera.capture')}
        </button>
        {cam.canSwitch && (
          <button className="btn-ghost" onClick={cam.switchCamera} disabled={cam.status === 'requesting'}>
            <SwitchCamera className="h-4 w-4" /> {t('camera.switch')}
          </button>
        )}
        {cam.devices.length > 1 && (
          <select className="input w-auto max-w-[220px]" value={cam.deviceId || ''} onChange={(e) => cam.start({ deviceId: e.target.value })} aria-label={t('camera.select')}>
            {cam.devices.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `${t('camera.camera')} ${i + 1}`}
              </option>
            ))}
          </select>
        )}
        <p className="w-full text-xs text-muted sm:ml-auto sm:w-auto">{stable ? t('camera.steady') : tracking.hand ? t('camera.holdStill') : t('camera.showPalm')}</p>
      </div>
    </div>
  );
}

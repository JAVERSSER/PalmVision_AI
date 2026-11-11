import { useCallback, useEffect, useRef, useState } from 'react';

/** Maps getUserMedia errors to i18n keys the UI can explain. */
function errorKey(err) {
  if (!window.isSecureContext) return 'camera.errors.insecure';
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'camera.errors.denied';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'camera.errors.notFound';
    case 'NotReadableError':
    case 'AbortError':
      return 'camera.errors.inUse';
    default:
      return 'camera.errors.generic';
  }
}

/**
 * Webcam access with permission handling, device switching and guaranteed
 * cleanup (all tracks are stopped when the component unmounts).
 */
export function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | requesting | active | error
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  const [facingMode, setFacingMode] = useState('user');

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus((s) => (s === 'error' ? s : 'idle'));
  }, []);

  const start = useCallback(
    async ({ deviceId: requestedId, facing } = {}) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(window.isSecureContext ? 'camera.errors.unsupported' : 'camera.errors.insecure');
        setStatus('error');
        return false;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setStatus('requesting');
      setError(null);
      const video = { width: { ideal: 1280 }, height: { ideal: 720 } };
      if (requestedId) video.deviceId = { exact: requestedId };
      else video.facingMode = facing || facingMode;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];
        const settings = track?.getSettings?.() || {};
        setDeviceId(settings.deviceId || requestedId || null);
        if (settings.facingMode) setFacingMode(settings.facingMode);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        const all = await navigator.mediaDevices.enumerateDevices();
        setDevices(all.filter((d) => d.kind === 'videoinput'));
        setStatus('active');
        return true;
      } catch (err) {
        console.warn('[camera]', err);
        setError(errorKey(err));
        setStatus('error');
        return false;
      }
    },
    [facingMode],
  );

  /** Cycles to the next camera (or toggles front/back on phones). */
  const switchCamera = useCallback(async () => {
    if (devices.length > 1) {
      const idx = devices.findIndex((d) => d.deviceId === deviceId);
      const next = devices[(idx + 1) % devices.length];
      return start({ deviceId: next.deviceId });
    }
    const facing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(facing);
    return start({ facing });
  }, [devices, deviceId, facingMode, start]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  // Front cameras are shown mirrored (like a mirror) for comfortable positioning.
  const mirrored = facingMode !== 'environment';

  return { videoRef, status, error, devices, deviceId, facingMode, mirrored, start, stop, switchCamera, canSwitch: devices.length > 1 || /Android|iPhone|iPad/i.test(navigator.userAgent) };
}

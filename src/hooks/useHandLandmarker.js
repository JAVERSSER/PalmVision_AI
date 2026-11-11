import { useEffect, useRef, useState } from 'react';
import { detectHandsInVideo, getHandLandmarker, pickPrimaryHand } from '../services/handDetection.js';

/**
 * Loads the MediaPipe model and, while `active`, runs live hand tracking on a
 * <video> element. Returns the latest primary hand and a stability counter
 * (consecutive frames with a hand in roughly the same place).
 */
export function useHandLandmarker(videoRef, { active, preferredHand }) {
  const [modelStatus, setModelStatus] = useState('idle'); // idle | loading | ready | error
  const [modelError, setModelError] = useState(null);
  const [frame, setFrame] = useState({ hand: null, handsCount: 0, stableFrames: 0, fps: 0, width: 0, height: 0 });
  const lastRef = useRef({ center: null, stable: 0, t: performance.now(), frames: 0, fps: 0 });

  useEffect(() => {
    let alive = true;
    setModelStatus('loading');
    getHandLandmarker('VIDEO')
      .then(() => alive && setModelStatus('ready'))
      .catch((err) => {
        console.error('[handLandmarker]', err);
        if (alive) {
          setModelStatus('error');
          setModelError(String(err?.message || err));
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!active || modelStatus !== 'ready') return undefined;
    let raf = 0;
    let lastVideoTime = -1;
    let cancelled = false;
    const loop = async () => {
      const video = videoRef.current;
      if (cancelled) return;
      if (video && video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        try {
          const res = await detectHandsInVideo(video, performance.now());
          const hand = pickPrimaryHand(res.hands, preferredHand);
          const st = lastRef.current;
          if (hand) {
            const c = hand.landmarks[9];
            const moved = st.center ? Math.hypot(c.x - st.center.x, c.y - st.center.y) : 1;
            st.stable = moved < 0.025 ? st.stable + 1 : 0;
            st.center = { x: c.x, y: c.y };
          } else {
            st.stable = 0;
            st.center = null;
          }
          st.frames++;
          const now = performance.now();
          if (now - st.t > 1000) {
            st.fps = Math.round((st.frames * 1000) / (now - st.t));
            st.frames = 0;
            st.t = now;
          }
          if (!cancelled) setFrame({ hand, handsCount: res.hands.length, stableFrames: st.stable, fps: st.fps, width: res.width, height: res.height });
        } catch (err) {
          console.warn('[handLandmarker] frame failed', err);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active, modelStatus, preferredHand, videoRef]);

  return { modelStatus, modelError, ...frame };
}

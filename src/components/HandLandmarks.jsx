import { useEffect, useRef } from 'react';
import { HAND_CONNECTIONS } from '../services/handDetection.js';

/**
 * Draws the 21 MediaPipe landmarks and skeleton on a canvas that exactly
 * covers its (relatively positioned) parent. Coordinates are normalised 0–1.
 */
export default function HandLandmarks({ landmarks, color = '#A78BFA', accent = '#D8B56D', className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const draw = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!landmarks?.length) return;
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (const [a, b] of HAND_CONNECTIONS) {
        ctx.moveTo(landmarks[a].x * w, landmarks[a].y * h);
        ctx.lineTo(landmarks[b].x * w, landmarks[b].y * h);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      landmarks.forEach((p, i) => {
        ctx.beginPath();
        ctx.fillStyle = [0, 1, 5, 9, 13, 17].includes(i) ? accent : '#F8FAFC';
        ctx.arc(p.x * w, p.y * h, i === 0 ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = color;
        ctx.stroke();
      });
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [landmarks, color, accent]);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden="true" />;
}

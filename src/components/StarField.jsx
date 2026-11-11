import { useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext.jsx';

/** Lightweight twinkling star background (canvas, ~90 particles, pauses when hidden). */
export default function StarField({ density = 90 }) {
  const ref = useRef(null);
  const { settings } = useSettings();
  const still = settings.reduceMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let raf = 0;
    let stars = [];
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      stars = Array.from({ length: density }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: (Math.random() * 1.2 + 0.3) * dpr,
        p: Math.random() * Math.PI * 2,
        s: 0.004 + Math.random() * 0.012,
        gold: Math.random() < 0.18,
        v: (Math.random() * 0.06 + 0.02) * dpr,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const light = document.documentElement.classList.contains('light');
      for (const st of stars) {
        st.p += st.s;
        if (!still) st.y -= st.v;
        if (st.y < -4) st.y = canvas.height + 4;
        const a = (0.35 + 0.65 * Math.abs(Math.sin(st.p))) * (light ? 0.35 : 0.9);
        ctx.beginPath();
        ctx.fillStyle = st.gold ? `rgba(216,181,109,${a})` : light ? `rgba(91,63,196,${a})` : `rgba(226,232,255,${a})`;
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!still) raf = requestAnimationFrame(draw);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) draw();
    };
    resize();
    draw();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [density, still]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10 h-full w-full" aria-hidden="true" />;
}

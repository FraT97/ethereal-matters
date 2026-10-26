import { useEffect, useRef } from 'react';

// Hero canvas: drifting points of light above a horizon, mirrored on the "water" below.
// The pointer gently pulls the lights toward it. Static frame when reduced motion is on.
export default function LightField({ horizon = 0.62 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, dpr, raf;
    const pointer = { x: -9999, y: -9999, active: false };

    const COLORS = ['79,227,218', '126,224,138', '200,255,246'];
    let lights = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(140, (w * h) / 9000));
      lights = Array.from({ length: count }, () => spawn(true));
    }

    function spawn(anywhere) {
      const hy = h * horizon;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * hy * 0.95 : hy * (0.75 + Math.random() * 0.2),
        r: 0.6 + Math.random() * 2.2,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.05 - Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.01,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    }

    function glow(x, y, r, color, alpha) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 9);
      g.addColorStop(0, `rgba(${color},${alpha})`);
      g.addColorStop(0.25, `rgba(${color},${alpha * 0.35})`);
      g.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 9, 0, Math.PI * 2);
      ctx.fill();
    }

    function frame(t = 0) {
      const hy = h * horizon;
      ctx.clearRect(0, 0, w, h);

      // faint glow sitting on the horizon line
      const band = ctx.createLinearGradient(0, hy - 60, 0, hy + 40);
      band.addColorStop(0, 'rgba(79,227,218,0)');
      band.addColorStop(0.6, 'rgba(79,227,218,0.10)');
      band.addColorStop(1, 'rgba(126,224,138,0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, hy - 60, w, 100);

      ctx.globalCompositeOperation = 'lighter';
      for (const L of lights) {
        if (!reduce) {
          L.phase += L.speed;
          if (pointer.active) {
            const dx = pointer.x - L.x;
            const dy = pointer.y - L.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 220 * 220) {
              L.vx += (dx / Math.sqrt(d2 + 1)) * 0.012;
              L.vy += (dy / Math.sqrt(d2 + 1)) * 0.012;
            }
          }
          L.vx *= 0.985;
          L.vy = L.vy * 0.985 - 0.0015;
          L.x += L.vx + Math.sin(L.phase) * 0.15;
          L.y += L.vy;
          if (L.y < -20 || L.x < -40 || L.x > w + 40 || L.y > hy) Object.assign(L, spawn(false));
        }
        const flicker = 0.55 + Math.sin(L.phase * 3) * 0.25;
        glow(L.x, L.y, L.r, L.c, flicker);

        // reflection: mirrored across the horizon, stretched and wobbling like water
        const ry = hy + (hy - L.y) * 0.55;
        if (ry < h) {
          const wobble = Math.sin(t * 0.002 + L.y * 0.05) * 3;
          ctx.save();
          ctx.translate(L.x + wobble, ry);
          ctx.scale(1.6, 0.45);
          glow(0, 0, L.r, L.c, flicker * 0.28 * (1 - (ry - hy) / (h - hy)));
          ctx.restore();
        }
      }
      ctx.globalCompositeOperation = 'source-over';

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = pointer.y < rect.height * horizon;
    };
    const onLeave = () => (pointer.active = false);

    resize();
    frame();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [horizon]);

  return <canvas ref={ref} className="lightfield" aria-hidden="true" />;
}

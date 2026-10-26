import { useEffect, useRef, useState } from 'react';
import Lumo from './Lumo.jsx';
import ScrollWisp from './ScrollWisp.jsx';

// "Lumo" — the Ethereal Matters light spirit.
// Desktop: floats after the pointer with a soft lag, eyes look where you point,
//   gets excited over links/buttons, throws sparks on click, falls asleep when idle.
// Touch screens and reduced motion: see ScrollWisp (rides the scroll on the right edge).

const SLEEP_AFTER = 9000;

export default function Wisp() {
  const el = useRef(null);
  const pupils = useRef(null);
  const [mood, setMood] = useState('idle'); // idle | happy | sleep | wow
  const [sparks, setSparks] = useState([]);
  const [mode, setMode] = useState('follow'); // follow | rest

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reduce || !fine) {
      setMode('rest');
      return;
    }

    const pos = { x: window.innerWidth - 90, y: window.innerHeight - 90 };
    const vel = { x: 0, y: 0 };
    const target = { ...pos };
    const pointer = { x: pos.x, y: pos.y };
    let raf;
    let sleepTimer;
    let lastMove = performance.now();
    let hovering = false;
    let t0 = performance.now();

    const wake = () => {
      clearTimeout(sleepTimer);
      setMood((m) => (m === 'sleep' ? 'wow' : m));
      sleepTimer = setTimeout(() => setMood('sleep'), SLEEP_AFTER);
    };

    const onMove = (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      // sit a little behind and below-right of the cursor, never on top of it
      target.x = e.clientX + 46;
      target.y = e.clientY + 40;
      lastMove = performance.now();
      wake();
      const interactive = e.target.closest?.('a, button, label, input, select, textarea, [role="tab"]');
      if (!!interactive !== hovering) {
        hovering = !!interactive;
        setMood(hovering ? 'happy' : 'idle');
      }
    };

    const onDown = (e) => {
      wake();
      const id = Date.now();
      const burst = Array.from({ length: 10 }, (_, i) => ({
        id: `${id}-${i}`,
        x: e.clientX,
        y: e.clientY,
        a: (i / 10) * Math.PI * 2 + Math.random() * 0.4,
        d: 30 + Math.random() * 40,
        c: i % 2 ? 'var(--cyan)' : 'var(--moss)',
      }));
      setSparks((s) => [...s, ...burst]);
      setTimeout(() => setSparks((s) => s.filter((p) => !p.id.startsWith(String(id)))), 700);
      setMood('wow');
      setTimeout(() => setMood(hovering ? 'happy' : 'idle'), 600);
    };

    const onLeave = () => {
      target.x = window.innerWidth - 90;
      target.y = window.innerHeight - 90;
    };

    function tick(now) {
      // spring toward target
      const k = 0.035;
      const damp = 0.82;
      vel.x = (vel.x + (target.x - pos.x) * k) * damp;
      vel.y = (vel.y + (target.y - pos.y) * k) * damp;
      pos.x += vel.x;
      pos.y += vel.y;

      const speed = Math.hypot(vel.x, vel.y);
      const idleFor = now - lastMove;
      const bob = Math.sin((now - t0) / 600) * (idleFor > 400 ? 5 : 1.5);
      const stretch = Math.min(speed / 25, 0.35);
      const tilt = Math.max(-25, Math.min(25, vel.x * 1.5));

      if (el.current) {
        el.current.style.transform =
          `translate3d(${pos.x - 32}px, ${pos.y - 32 + bob}px, 0) rotate(${tilt}deg) scale(${1 - stretch * 0.4}, ${1 + stretch})`;
      }
      // eyes look at the pointer
      if (pupils.current) {
        const dx = pointer.x - pos.x;
        const dy = pointer.y - pos.y;
        const d = Math.hypot(dx, dy) || 1;
        const m = Math.min(d / 30, 2.2);
        pupils.current.setAttribute('transform', `translate(${(dx / d) * m} ${(dy / d) * m})`);
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    document.documentElement.addEventListener('mouseleave', onLeave);
    sleepTimer = setTimeout(() => setMood('sleep'), SLEEP_AFTER);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(sleepTimer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const body = <Lumo mood={mood} pupilsRef={pupils} />;

  return (
    <>
      {mode === 'follow' ? (
        <div ref={el} className={`wisp is-follow mood-${mood}`} aria-hidden="true">
          {body}
          {mood === 'sleep' && <span className="wisp-z">z<span>z</span></span>}
        </div>
      ) : (
        <ScrollWisp />
      )}
      {sparks.map((s) => (
        <span
          key={s.id}
          className="spark"
          style={{
            left: s.x,
            top: s.y,
            background: s.c,
            '--dx': `${Math.cos(s.a) * s.d}px`,
            '--dy': `${Math.sin(s.a) * s.d}px`,
          }}
        />
      ))}
    </>
  );
}

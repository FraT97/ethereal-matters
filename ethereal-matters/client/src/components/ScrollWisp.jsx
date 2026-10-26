import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Lumo from './Lumo.jsx';

// Lumo on phones (and whenever there's no mouse): it rides a thin light rail on the
// right edge and its height shows how far down the page you are — a living scroll bar.
// It looks the way you scroll, gets excited when you scroll fast, dozes off when you stop,
// and greets you at the bottom. Tap it to fly back to the top (or to hear it talk).

const LINES = [
  'I only come out after sunset.',
  'Psst — try the filters.',
  'I was born on a lake.',
  'Fog is my favourite weather.',
  'Have a field? I want to see it.',
];
const TOP = 96; // px from the top of the screen (below the header)
const BOTTOM = 120; // px from the bottom
const SLEEP_AFTER = 8000;

export default function ScrollWisp() {
  const el = useRef(null);
  const fill = useRef(null);
  const [mood, setMood] = useState('idle');
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [line, setLine] = useState('');
  const { pathname } = useLocation();
  const lineTimer = useRef();
  const greetedBottom = useRef(false);

  const say = (text, ms = 2600) => {
    clearTimeout(lineTimer.current);
    setLine(text);
    lineTimer.current = setTimeout(() => setLine(''), ms);
  };

  // little hello on each new page
  useEffect(() => {
    greetedBottom.current = false;
    setMood('wow');
    const t = setTimeout(() => setMood('idle'), 800);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    let lastY = window.scrollY;
    let lastT = performance.now();
    let ticking = false;
    let settle;
    let sleep;

    const place = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const range = window.innerHeight - TOP - BOTTOM;
      if (el.current) el.current.style.setProperty('--y', `${TOP + p * range}px`);
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      return p;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const now = performance.now();
        const dy = window.scrollY - lastY;
        const speed = Math.abs(dy) / Math.max(16, now - lastT); // px per ms
        lastY = window.scrollY;
        lastT = now;
        const p = place();

        if (el.current) el.current.style.setProperty('--tilt', `${Math.max(-18, Math.min(18, dy * 0.6))}deg`);
        setLook({ x: 0, y: dy > 0 ? 2.2 : dy < 0 ? -2.2 : 0 });
        setMood(speed > 2.2 ? 'wow' : 'happy');

        clearTimeout(settle);
        clearTimeout(sleep);
        settle = setTimeout(() => {
          if (el.current) el.current.style.setProperty('--tilt', '0deg');
          setLook({ x: 0, y: 0 });
          setMood('idle');
        }, 500);
        sleep = setTimeout(() => setMood('sleep'), SLEEP_AFTER);

        if (p > 0.985 && !greetedBottom.current) {
          greetedBottom.current = true;
          say("That's everything. Say hi?", 3200);
        }
        if (p < 0.9) greetedBottom.current = false;
      });
    };

    place();
    sleep = setTimeout(() => setMood('sleep'), SLEEP_AFTER);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', place);
    // page height changes when more works load
    const ro = new ResizeObserver(place);
    ro.observe(document.body);
    return () => {
      clearTimeout(settle);
      clearTimeout(sleep);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', place);
      ro.disconnect();
    };
  }, []);

  function tap() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.scrollY > 400) {
      say('Back to the top!', 1600);
      setMood('happy');
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    } else {
      setMood('happy');
      say(LINES[Math.floor(Math.random() * LINES.length)]);
    }
  }

  return (
    <>
      <div className="lumo-rail" aria-hidden="true" style={{ top: TOP, bottom: BOTTOM }}>
        <span ref={fill} />
      </div>
      <button
        ref={el}
        className={`wisp is-rider mood-${mood} ${line || mood === 'wow' || mood === 'happy' ? 'is-out' : ''}`}
        onClick={tap}
        aria-label="Lumo, the light spirit. Shows how far down the page you are. Tap to go back to the top."
      >
        <Lumo mood={mood} look={look} />
        {mood === 'sleep' && <span className="wisp-z" aria-hidden="true">z<span>z</span></span>}
        {line && <span className="wisp-bubble" role="status">{line}</span>}
      </button>
    </>
  );
}

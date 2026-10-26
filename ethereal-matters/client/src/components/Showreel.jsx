import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Scene from './Scene.jsx';
import logo from '../assets/logo.webp';
import { getProjects } from '../lib/api.js';
import { SHOWREEL_URL, categoryLabel } from '../lib/labels.js';

// Open it from anywhere with: openShowreel(event)
export function openShowreel(e) {
  const r = e?.currentTarget?.getBoundingClientRect?.();
  const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
  const y = r ? r.top + r.height / 2 : window.innerHeight / 2;
  window.dispatchEvent(new CustomEvent('open-showreel', { detail: { x, y } }));
}

const SHOT = 3400; // ms per project in the generated reel
const TITLE = 2600;
const COUNTDOWN = ['3', '2', '1'];
const IS_FILE = /\.(mp4|webm|mov)(\?|$)/i.test(SHOWREEL_URL);
const MODE = !SHOWREEL_URL ? 'generated' : IS_FILE ? 'video' : 'embed';

const fmt = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function Showreel({ origin, onClose }) {
  const reduce = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  const [phase, setPhase] = useState('opening'); // opening | countdown | play | end | closing
  const [count, setCount] = useState(0);
  const [projects, setProjects] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0); // ms
  const [duration, setDuration] = useState(0);
  const [idle, setIdle] = useState(false); // controls fade away while the reel plays untouched
  const videoRef = useRef(null);
  const closeRef = useRef(null);
  const timeRef = useRef(0);

  // ----- the generated reel: title card, one shot per featured work, outro -----
  const shots = useMemo(() => {
    if (MODE !== 'generated') return [];
    const list = [{ kind: 'title', len: TITLE }];
    projects.forEach((p) => list.push({ kind: 'work', p, len: SHOT }));
    list.push({ kind: 'outro', len: 2400 });
    let at = 0;
    return list.map((s) => ({ ...s, at: (at += s.len) - s.len }));
  }, [projects]);

  useEffect(() => {
    if (MODE === 'generated') {
      getProjects({ featured: true }, { limit: 6 }).then((r) => setProjects(r.items)).catch(() => {});
    }
  }, []);
  useEffect(() => {
    if (MODE === 'generated' && shots.length) setDuration(shots.at(-1).at + shots.at(-1).len);
  }, [shots]);

  const shotIndex = shots.length ? Math.max(0, shots.findLastIndex((s) => s.at <= time)) : 0;
  const shot = shots[shotIndex];

  // ----- open sequence: iris → countdown → play -----
  useEffect(() => {
    document.body.classList.add('reel-open');
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const t = setTimeout(() => (reduce ? start() : setPhase('countdown')), reduce ? 0 : 650);
    return () => {
      clearTimeout(t);
      document.body.classList.remove('reel-open');
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count >= COUNTDOWN.length) return start();
    const t = setTimeout(() => setCount((c) => c + 1), 650);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, count]);

  function start() {
    setPhase('play');
    setPlaying(true);
    if (MODE === 'video') videoRef.current?.play().catch(() => setPlaying(false));
  }

  // ----- clock for the generated reel -----
  useEffect(() => {
    if (MODE !== 'generated' || !playing || !duration) return;
    let last = performance.now();
    let raf;
    const tick = (now) => {
      timeRef.current = Math.min(duration, timeRef.current + (now - last));
      last = now;
      setTime(timeRef.current);
      if (timeRef.current >= duration) {
        setPlaying(false);
        setPhase('end');
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration]);

  const seek = useCallback(
    (ms) => {
      const v = Math.max(0, Math.min(duration, ms));
      if (MODE === 'video' && videoRef.current) videoRef.current.currentTime = v / 1000;
      timeRef.current = v;
      setTime(v);
      if (phase === 'end' && v < duration) setPhase('play');
    },
    [duration, phase]
  );

  const toggle = useCallback(() => {
    if (phase === 'countdown' || phase === 'opening') return start();
    if (phase === 'end') {
      seek(0);
      setPhase('play');
      setPlaying(true);
      if (MODE === 'video') videoRef.current?.play();
      return;
    }
    const next = !playing;
    setPlaying(next);
    if (MODE === 'video') next ? videoRef.current?.play() : videoRef.current?.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, playing, seek]);

  const close = useCallback(() => {
    setPlaying(false);
    videoRef.current?.pause();
    setPhase('closing');
    setTimeout(onClose, reduce ? 0 : 550);
  }, [onClose, reduce]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === ' ' && MODE !== 'embed') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'ArrowRight' && MODE !== 'embed') {
        const n = shots[shotIndex + 1];
        seek(n ? n.at : time + 5000);
      } else if (e.key === 'ArrowLeft' && MODE !== 'embed') {
        seek(shot ? shot.at - (time - shot.at < 600 ? (shots[shotIndex - 1]?.len || 0) : 0) : time - 5000);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, toggle, seek, shots, shotIndex, shot, time]);

  const progress = duration ? time / duration : 0;
  // Fade the controls out after a moment of no movement; any move or tap brings them back
  useEffect(() => {
    let t;
    const wake = () => {
      setIdle(false);
      clearTimeout(t);
      t = setTimeout(() => setIdle(true), 2600);
    };
    wake();
    window.addEventListener('pointermove', wake);
    window.addEventListener('pointerdown', wake);
    window.addEventListener('keydown', wake);
    return () => {
      clearTimeout(t);
      window.removeEventListener('pointermove', wake);
      window.removeEventListener('pointerdown', wake);
      window.removeEventListener('keydown', wake);
    };
  }, []);

  const neon = shot?.p?.hue === 'green' ? 'var(--moss)' : 'var(--cyan)';

  const onTrack = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    seek(((e.clientX - r.left) / r.width) * duration);
  };

  return (
    <div
      className={`reel phase-${phase} ${idle && playing ? 'is-idle' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Showreel"
      style={{ '--ox': `${origin.x}px`, '--oy': `${origin.y}px` }}
    >
      <button ref={closeRef} className="reel-close" onClick={close}>
        Lights on
      </button>

      {/* ---------- the picture ---------- */}
      <div className="reel-stage" onClick={MODE !== 'embed' ? toggle : undefined}>
        {MODE === 'video' && (
          <video
            ref={videoRef}
            src={SHOWREEL_URL}
            playsInline
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration * 1000)}
            onTimeUpdate={(e) => setTime(e.currentTarget.currentTime * 1000)}
            onEnded={() => {
              setPlaying(false);
              setPhase('end');
            }}
          />
        )}
        {MODE === 'embed' && phase !== 'opening' && phase !== 'countdown' && (
          <iframe src={SHOWREEL_URL} title="Ethereal Matters showreel" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
        )}
        {MODE === 'generated' && shot && (phase === 'play' || phase === 'end' || phase === 'closing') && (
          <div className="reel-shot" key={`shot-${shotIndex}`} style={{ '--neon': neon }}>
            {shot.kind === 'work' && (
              <>
                <Scene project={shot.p} className="reel-media" align="xMidYMid" />
                <div className="reel-caption">
                  <span className="reel-num">{String(shotIndex).padStart(2, '0')}</span>
                  <h2>{shot.p.title}</h2>
                  <p>{categoryLabel(shot.p.category)} in {shot.p.region}, {shot.p.year}</p>
                </div>
              </>
            )}
            {shot.kind === 'title' && (
              <div className="reel-card">
                <img className="reel-logo" src={logo} alt="" />
                <h2 className="reel-wordmark">
                  {'ethereal matters'.split('').map((ch, i) => (
                    <span key={i} style={{ '--i': i }}>{ch === ' ' ? ' ' : ch}</span>
                  ))}
                </h2>
                <p>Showreel {new Date().getFullYear()}</p>
              </div>
            )}
            {shot.kind === 'outro' && (
              <div className="reel-card">
                <h2>Your place could be next.</h2>
              </div>
            )}
          </div>
        )}

        {phase === 'countdown' && count < COUNTDOWN.length && (
          <div className="reel-countdown" key={`count-${count}`} aria-hidden="true">
            <span>{COUNTDOWN[count]}</span>
          </div>
        )}

        {phase === 'end' && (
          <div className="reel-end" onClick={(e) => e.stopPropagation()}>
            <Link className="btn btn-solid" to="/contact" onClick={close}>Plan an event with us</Link>
            <button className="btn" onClick={toggle}>Watch again</button>
          </div>
        )}
      </div>

      {/* ---------- controls ---------- */}
      <div className={`reel-controls ${MODE === 'embed' ? 'is-embed' : ''}`}>
        {MODE !== 'embed' && (
          <button className="reel-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? (
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3h3.5v14H5zM11.5 3H15v14h-3.5z" /></svg>
            ) : (
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3l12 7-12 7z" /></svg>
            )}
          </button>
        )}

        <div
          className="reel-track"
          onClick={MODE !== 'embed' ? onTrack : undefined}
          role={MODE !== 'embed' ? 'slider' : undefined}
          aria-label="Showreel progress"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration / 1000)}
          aria-valuenow={Math.round(time / 1000)}
          aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
          tabIndex={MODE !== 'embed' ? 0 : -1}
        >
          {MODE !== 'embed' && (
            <>
              <div className="reel-track-line" />
              <div className="reel-track-fill" style={{ transform: `scaleX(${progress})` }} />
              {shots.slice(1).map((s) => (
                <span key={s.at} className={`reel-tick ${time >= s.at ? 'lit' : ''}`} style={{ left: `${(s.at / duration) * 100}%` }} />
              ))}
            </>
          )}
          {MODE !== 'embed' && <span className="reel-head" style={{ left: `${progress * 100}%` }} aria-hidden="true" />}
        </div>

        {MODE !== 'embed' && <span className="reel-time">{fmt(time)} / {fmt(duration)}</span>}
      </div>
    </div>
  );
}

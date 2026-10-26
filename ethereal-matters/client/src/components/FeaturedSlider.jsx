import { Link } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import Scene from './Scene.jsx';
import LightField from './LightField.jsx';
import { categoryLabel } from '../lib/labels.js';
import { openShowreel } from './Showreel.jsx';

const DURATION = 7000;

// Full-screen slider of featured works, advancing on its own.
// Pauses on hover/focus; no autoplay when reduced motion is on.
export default function FeaturedSlider({ projects }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const count = projects.length;
  const touch = useRef({ x: 0, y: 0 });

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    if (!count || paused || reduce.current) return;
    const id = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(id);
  }, [index, paused, count, go]);

  if (!count) return <section className="slider slider-empty" />;

  const current = projects[index];

  // swipe left/right on touch screens (vertical swipes keep scrolling the page)
  const onTouchStart = (e) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
    setPaused(true);
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) go(index + (dx < 0 ? 1 : -1));
    setPaused(false);
  };

  return (
    <section
      className={`slider ${paused ? 'is-paused' : ''}`}
      aria-roledescription="carousel"
      aria-label="Featured works"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1);
        if (e.key === 'ArrowLeft') go(index - 1);
      }}
    >
      {projects.map((p, i) => (
        <div
          key={p.slug}
          className={`slide ${i === index ? 'active' : ''}`}
          aria-hidden={i !== index}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}`}
        >
          <Scene project={p} className="slide-media" align="xMaxYMid" />
        </div>
      ))}
      <LightField horizon={1} />
      <div className="slider-shade" />

      <div className="slider-copy" key={current.slug}>
        <p className="slider-tag">Featured</p>
        <h2 className="slider-title">{current.title}</h2>
        <p className="slider-meta">
          {categoryLabel(current.category)}, {current.region} {current.year}
        </p>
        <div className="slider-actions">
          <Link className="btn btn-solid" to={`/works/${current.slug}`}>
            More
          </Link>
          <button className="btn btn-play" onClick={openShowreel}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z" /></svg>
            Play showreel
          </button>
        </div>
      </div>

      <div className="slider-controls">
        <span className="slider-count" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </span>
        <div className="slider-bars">
          {projects.map((p, i) => (
            <button
              key={p.slug}
              className={`bar ${i === index ? 'active' : ''} ${i < index ? 'done' : ''}`}
              onClick={() => go(i)}
              aria-label={`Show ${p.title}`}
              aria-current={i === index}
              style={{ '--dur': `${DURATION}ms` }}
            >
              <span />
            </button>
          ))}
        </div>
        <div className="slider-arrows">
          <button onClick={() => go(index - 1)} aria-label="Previous work">‹</button>
          <button onClick={() => go(index + 1)} aria-label="Next work">›</button>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';

// "Lights off" = dark theme (default), "lights on" = light theme.
// The choice is remembered in this browser. Switching opens a circle of
// light from the button where the browser supports view transitions.

function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#eef6f3' : '#020f11');
    try {
      localStorage.setItem('em-theme', theme);
    } catch {
      /* storage unavailable: the choice just won't be remembered */
    }
  }, [theme]);

  function toggle(e) {
    const next = theme === 'light' ? 'dark' : 'light';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) return setTheme(next);

    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const t = document.startViewTransition(() => {
      document.documentElement.dataset.theme = next;
      setTheme(next);
    });
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  }

  const on = theme === 'light';

  return (
    <button
      className={`theme-toggle ${on ? 'is-on' : ''}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Lights on: switch to dark mode' : 'Lights off: switch to light mode'}
      title={on ? 'Lights off' : 'Lights on'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g className="rays">
          <path d="M12 1.5v1.8M4.6 4.6l1.3 1.3M19.4 4.6l-1.3 1.3M1.8 11h1.8M20.4 11h1.8" />
        </g>
        <path className="bulb" d="M12 4.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V18h5.2v-.7c0-.8.4-1.5 1-2A6 6 0 0 0 12 4.5z" />
        <path className="base" d="M9.6 20.2h4.8M10.4 22.2h3.2" />
        <path className="filament" d="M10.3 13.5l1-2 .7 1.4.7-1.4 1 2" />
      </svg>
    </button>
  );
}

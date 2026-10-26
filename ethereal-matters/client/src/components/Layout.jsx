import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import Showreel, { openShowreel } from './Showreel.jsx';
import Wisp from './Wisp.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'Vimeo', href: 'https://vimeo.com' },
  { label: 'SoundCloud', href: 'https://soundcloud.com' },
];
const EMAIL = 'hello@etherealmatters.com';

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [reel, setReel] = useState(null); // origin {x, y} while open
  const [hidden, setHidden] = useState(false); // header slides away while scrolling down
  const [scrolled, setScrolled] = useState(false); // past the top of the page
  const { pathname } = useLocation();
  const closeReel = useCallback(() => setReel(null), []);

  useEffect(() => {
    const onOpen = (e) => {
      setOpen(false);
      setReel(e.detail);
    };
    window.addEventListener('open-showreel', onOpen);
    return () => window.removeEventListener('open-showreel', onOpen);
  }, []);

  useEffect(() => {
    setOpen(false);
    setHidden(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // Hide the header when scrolling down, bring it back as soon as you scroll up
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        if (Math.abs(delta) > 6) {
          setHidden(delta > 0 && y > 140);
          lastY = y;
        }
        setScrolled(y > 40);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lets sticky bars (e.g. the works filters) sit under the header only while it's visible
  useEffect(() => {
    document.body.classList.toggle('header-hidden', hidden && !open);
  }, [hidden, open]);

  // Full-screen menu: lock the page behind it, close with Escape
  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const headerClass = [
    'site-header',
    pathname === '/' && 'is-home',
    scrolled && 'is-scrolled',
    hidden && !open && 'is-hidden',
    open && 'menu-is-open',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className={headerClass}>
        <Link to="/" className="wordmark" aria-label="Ethereal Matters, home">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="9" r="4.5" />
            <path d="M5 18.5h14" />
            <path d="M8 21.5h8" opacity=".5" />
          </svg>
          ethereal matters
        </Link>
        <div className="header-actions">
          <ThemeToggle />
          <button
            className={`menu-toggle ${open ? 'is-open' : ''}`}
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {/* three LED tubes */}
            <span className="tube" style={{ '--i': 0 }} />
            <span className="tube" style={{ '--i': 1 }} />
            <span className="tube" style={{ '--i': 2 }} />
          </button>
        </div>
        <nav id="site-nav" className={open ? 'open' : ''} aria-label="Main">
          <div className="nav-links">
            <NavLink to="/" end style={{ '--i': 0 }}>Works</NavLink>
            <button className="nav-btn" onClick={openShowreel} style={{ '--i': 1 }}>Showreel</button>
            <NavLink to="/services" style={{ '--i': 2 }}>Services</NavLink>
            <NavLink to="/about" style={{ '--i': 3 }}>About us</NavLink>
            <NavLink to="/contact" style={{ '--i': 4 }}>Contact us</NavLink>
          </div>
          <div className="nav-extra">
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            <div>
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">{s.label}</a>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-cols">
          <div>
            <h2>Contact us</h2>
            <a className="footer-big" href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
          <div>
            <h2>Follow us</h2>
            <ul className="footer-links">
              {SOCIALS.map((s) => (
                <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer">{s.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <small>Ethereal Matters © {new Date().getFullYear()}</small>
          <small>We leave every place as dark as we found it</small>
        </div>
      </footer>

      {reel && <Showreel origin={reel} onClose={closeReel} />}
      <Wisp />
    </>
  );
}

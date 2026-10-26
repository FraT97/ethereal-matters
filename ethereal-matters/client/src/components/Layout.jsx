import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import Showreel, { openShowreel } from './Showreel.jsx';
import Wisp from './Wisp.jsx';

export default function Layout() {
  const [open, setOpen] = useState(false);
  const [reel, setReel] = useState(null); // origin {x, y} while open
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
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className={`site-header ${pathname === '/' ? 'is-home' : ''}`}>
        <Link to="/" className="wordmark" aria-label="Ethereal Matters, home">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="9" r="4.5" />
            <path d="M5 18.5h14" />
            <path d="M8 21.5h8" opacity=".5" />
          </svg>
          ethereal matters
        </Link>
        <button className="menu-toggle" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((o) => !o)}>
          {open ? 'Close' : 'Menu'}
        </button>
        <nav id="site-nav" className={open ? 'open' : ''}>
          <NavLink to="/" end>Works</NavLink>
          <button className="nav-btn" onClick={openShowreel}>Showreel</button>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/about">About us</NavLink>
          <NavLink to="/contact">Contact us</NavLink>
        </nav>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-cols">
          <div>
            <h2>Contact us</h2>
            <a className="footer-big" href="mailto:hello@etherealmatters.com">hello@etherealmatters.com</a>
          </div>
          <div>
            <h2>Follow us</h2>
            <ul className="footer-links">
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a></li>
              <li><a href="https://vimeo.com" target="_blank" rel="noreferrer">Vimeo</a></li>
              <li><a href="https://soundcloud.com" target="_blank" rel="noreferrer">SoundCloud</a></li>
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

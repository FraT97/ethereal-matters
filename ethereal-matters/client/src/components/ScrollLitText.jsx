import { useEffect, useRef } from 'react';

// Text whose words light up one after another as you scroll past it,
// like a row of lamps switching on. Fully lit straight away with reduced motion.
export default function ScrollLitText({ text, as: Tag = 'p', className = '' }) {
  const ref = useRef(null);
  const words = text.split(' ');

  useEffect(() => {
    const node = ref.current;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.style.setProperty('--p', 1);
      return;
    }
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the text's top reaches 85% of the screen, 1 when its bottom reaches 45%
      const start = vh * 0.85;
      const end = vh * 0.45;
      const p = (start - r.top) / (start - end + r.height);
      node.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <Tag ref={ref} className={`lit-text ${className}`} style={{ '--n': words.length }}>
      {words.map((w, i) => (
        <span key={i} className="lit-word" style={{ '--w': i }}>
          {w}{' '}
        </span>
      ))}
    </Tag>
  );
}

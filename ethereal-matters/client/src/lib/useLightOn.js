import { useEffect } from 'react';

// Adds the class "is-lit" to elements matching `selector` inside `ref`
// as they scroll into view (once). Everything is lit straight away with reduced motion.
export default function useLightOn(ref, selector, deps = []) {
  useEffect(() => {
    const els = ref.current?.querySelectorAll(`${selector}:not(.is-lit)`) || [];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('is-lit'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-lit');
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.35, rootMargin: '0px 0px -10% 0px' }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

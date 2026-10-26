// Shows the project's first photo. Without photos, it draws a light scene
// based on where the installation lived (lake, forest, park, urban, indoor).

const PALETTE = {
  cyan: ['#4FE3DA', '#B9FFF8'],
  green: ['#7EE08A', '#D6FFD0'],
  mixed: ['#4FE3DA', '#7EE08A'],
};

function rand(seed) {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

export default function Scene({ project, className = '', align = 'xMidYMax' }) {
  const { slug, setting, hue = 'mixed', images = [], title } = project;

  if (images.length) {
    return <img className={`scene ${className}`} src={images[0]} alt={title} loading="lazy" />;
  }

  const [a, b] = PALETTE[hue] || PALETTE.mixed;
  const r = rand(slug);
  const id = `s-${slug}`;
  const H = 62; // horizon in viewBox units (0–100)

  let lights = null;
  if (setting === 'lake') {
    lights = Array.from({ length: 5 }, (_, i) => {
      const x = 14 + i * 18 + r() * 6;
      const y = 34 + r() * 14;
      const rr = 4 + r() * 5;
      const c = i % 2 ? b : a;
      return (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={rr} ry={rr * 0.9} fill="none" stroke={c} strokeWidth="0.7" filter={`url(#${id}-blur)`} />
          <ellipse cx={x} cy={y} rx={rr} ry={rr * 0.9} fill="none" stroke={c} strokeWidth="0.35" />
          <ellipse cx={x} cy={2 * H - y} rx={rr * 1.1} ry={rr * 0.35} fill="none" stroke={c} strokeWidth="0.4" opacity="0.35" filter={`url(#${id}-blur)`} />
        </g>
      );
    });
  } else if (setting === 'forest') {
    lights = Array.from({ length: 9 }, (_, i) => {
      const x = 4 + i * 11.5 + r() * 4;
      return (
        <g key={i}>
          <rect x={x} y={8 + r() * 10} width={0.9 + r()} height={H} fill="#021012" />
          <rect x={x - 4} y="0" width="9" height={H} fill={`url(#${id}-up)`} opacity={0.25 + r() * 0.5} />
        </g>
      );
    });
  } else if (setting === 'park') {
    lights = Array.from({ length: 7 }, (_, i) => {
      const y = 38 + i * 3.2;
      return (
        <line key={i} x1="0" y1={y + r() * 4} x2="100" y2={y - 6 + r() * 4} stroke={i % 2 ? a : b} strokeWidth="0.25" opacity={0.4 + r() * 0.5} filter={`url(#${id}-blur)`} />
      );
    }).concat(<rect key="fog" x="0" y="48" width="100" height="16" fill={`url(#${id}-fog)`} />);
  } else if (setting === 'urban') {
    lights = (
      <>
        <path d={`M8 ${H} V34 Q50 4 92 34 V${H}`} fill="none" stroke={a} strokeWidth="0.6" filter={`url(#${id}-blur)`} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M${14 + i * 2} ${H} V${36 - i} Q50 ${10 + i * 3} ${86 - i * 2} ${36 - i} V${H}`} fill="none" stroke={i % 2 ? b : a} strokeWidth="0.3" opacity={0.2 + i * 0.1} />
        ))}
      </>
    );
  } else {
    lights = Array.from({ length: 4 }, (_, i) => (
      <g key={i}>
        <rect x={10 + i * 21} y="18" width="17" height={H - 18} fill="none" stroke={a} strokeWidth="0.3" opacity="0.5" />
        <circle cx={18 + i * 21 + r() * 2} cy={44 + r() * 8} r={3 + r() * 4} fill={i % 2 ? b : a} opacity="0.5" filter={`url(#${id}-blur)`} />
      </g>
    ));
  }

  return (
    <svg className={`scene ${className}`} viewBox="0 0 100 75" preserveAspectRatio={`${align} slice`} role="img" aria-label={`Light scene for ${title}`}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020D0F" />
          <stop offset="0.8" stopColor="#06292B" />
        </linearGradient>
        <linearGradient id={`${id}-up`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={b} stopOpacity="0.9" />
          <stop offset="1" stopColor={b} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-fog`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} stopOpacity="0" />
          <stop offset="0.5" stopColor={a} stopOpacity="0.18" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
      <rect width="100" height="75" fill={`url(#${id}-sky)`} />
      {lights}
      <rect y={H} width="100" height={75 - H} fill="#021012" opacity="0.85" />
      <line x1="0" y1={H} x2="100" y2={H} stroke={a} strokeWidth="0.15" opacity="0.6" />
    </svg>
  );
}

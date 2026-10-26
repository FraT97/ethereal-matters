import { useId } from 'react';

// Lumo's body. Shared by the cursor companion (Wisp) and the showreel.
// mood: idle | happy | sleep | wow
// look: optional {x, y} pupil offset (−2..2) when there's no pupilsRef animating it
export default function Lumo({ mood = 'idle', pupilsRef, look }) {
  const gid = `wisp-core-${useId().replace(/:/g, '')}`;
  const pupilShift = look ? `translate(${look.x} ${look.y})` : undefined;

  return (
    <svg viewBox="0 0 64 64" className="wisp-svg" aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="45%" cy="40%" r="60%">
          <stop offset="0" stopColor="#F2FFFC" />
          <stop offset="0.45" stopColor="var(--wisp-a)" />
          <stop offset="1" stopColor="var(--wisp-b)" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      {/* trailing flame tail */}
      <path className="wisp-tail" d="M32 50 C 22 52, 16 60, 8 62 C 18 56, 20 50, 22 46 Z" fill="var(--wisp-b)" opacity=".55" />
      <path className="wisp-tail t2" d="M34 50 C 40 54, 46 60, 54 61 C 46 55, 44 50, 42 46 Z" fill="var(--wisp-a)" opacity=".4" />
      {/* body: a soft droplet of light with a flickering top */}
      <path className="wisp-body" d="M32 8 C 36 14, 40 13, 44 18 C 52 26, 52 42, 42 49 C 36 53, 28 53, 22 49 C 12 42, 13 26, 21 19 C 25 15, 29 14, 32 8 Z" fill={`url(#${gid})`} />
      {/* cheeks */}
      <ellipse cx="22.5" cy="37" rx="3.2" ry="2" fill="var(--moss)" opacity={mood === 'happy' ? 0.8 : 0.35} />
      <ellipse cx="41.5" cy="37" rx="3.2" ry="2" fill="var(--moss)" opacity={mood === 'happy' ? 0.8 : 0.35} />
      {/* eyes */}
      {mood === 'sleep' ? (
        <g stroke="#032326" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M23 32 q3 2 6 0" />
          <path d="M35 32 q3 2 6 0" />
        </g>
      ) : mood === 'happy' ? (
        <g stroke="#032326" strokeWidth="2.2" strokeLinecap="round" fill="none">
          <path d="M23 33 q3 -4 6 0" />
          <path d="M35 33 q3 -4 6 0" />
        </g>
      ) : (
        <g className="wisp-eyes">
          <ellipse cx="26" cy="31" rx={mood === 'wow' ? 4.2 : 3.6} ry={mood === 'wow' ? 5 : 4.4} fill="#F2FFFC" />
          <ellipse cx="38" cy="31" rx={mood === 'wow' ? 4.2 : 3.6} ry={mood === 'wow' ? 5 : 4.4} fill="#F2FFFC" />
          <g ref={pupilsRef} transform={pupilShift} style={{ transition: look ? 'transform .4s' : undefined }}>
            <circle cx="26" cy="31.5" r="2.1" fill="#032326" />
            <circle cx="38" cy="31.5" r="2.1" fill="#032326" />
          </g>
        </g>
      )}
      {/* mouth */}
      {mood === 'wow' ? (
        <ellipse cx="32" cy="41" rx="2.2" ry="2.8" fill="#032326" />
      ) : mood === 'sleep' ? null : (
        <path d={mood === 'happy' ? 'M28 39 q4 5 8 0' : 'M29.5 40 q2.5 2 5 0'} stroke="#032326" strokeWidth="1.8" strokeLinecap="round" fill={mood === 'happy' ? '#032326' : 'none'} />
      )}
    </svg>
  );
}

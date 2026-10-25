// Original SVG botanical art. Decorative only (aria-hidden), no external assets to break.

type P = { className?: string; color?: string; center?: string };

export function Blossom({ className, color = "#F2A6B3", center = "#D9A441" }: P) {
  return (
    <svg viewBox="-60 -60 120 120" className={className} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((r) => (
        <g key={r} transform={`rotate(${r})`}>
          <path d="M0 -4 C-22 -22 -20 -52 0 -56 C20 -52 22 -22 0 -4Z" fill={color} />
          <path d="M0 -8 C-8 -22 -7 -40 0 -48" stroke="#fff" strokeOpacity=".45" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
      ))}
      <circle r="8" fill={center} />
      {[0, 60, 120, 180, 240, 300].map((r) => (
        <circle key={r} cx={Math.cos((r * Math.PI) / 180) * 13} cy={Math.sin((r * Math.PI) / 180) * 13} r="1.8" fill={center} />
      ))}
    </svg>
  );
}

export function Leaf({ className, color = "#315B46" }: P) {
  return (
    <svg viewBox="0 0 120 220" className={className} aria-hidden="true">
      <path d="M60 215 C8 150 6 70 60 6 C114 70 112 150 60 215Z" fill={color} />
      <path d="M60 205 L60 22" stroke="#FFF9F0" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
      {[40, 70, 100, 130, 160].map((y) => (
        <g key={y} stroke="#FFF9F0" strokeOpacity=".25" strokeWidth="1.5" strokeLinecap="round">
          <path d={`M60 ${y + 12} L28 ${y - 6}`} />
          <path d={`M60 ${y + 12} L92 ${y - 6}`} />
        </g>
      ))}
    </svg>
  );
}

export function Palm({ className, color = "#315B46" }: P) {
  return (
    <svg viewBox="0 0 260 260" className={className} aria-hidden="true">
      {[-70, -40, -12, 14, 42, 70].map((r) => (
        <path key={r} transform={`rotate(${r} 130 250)`} d="M130 250 C112 170 116 90 130 18 C144 90 148 170 130 250Z" fill={color} fillOpacity={r % 2 ? 0.88 : 1} />
      ))}
    </svg>
  );
}

export function Sun({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFE3A3" />
          <stop offset=".55" stopColor="#F9B15E" />
          <stop offset="1" stopColor="#F28C45" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#sunGlow)" opacity=".35" />
      <circle cx="100" cy="100" r="64" fill="url(#sunGlow)" />
    </svg>
  );
}

export function SandWave({ className, color = "#E8D4B5" }: P) {
  return (
    <svg viewBox="0 0 800 160" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M0 90 C120 30 240 30 360 80 C480 130 620 120 800 50 L800 160 L0 160Z" fill={color} />
    </svg>
  );
}

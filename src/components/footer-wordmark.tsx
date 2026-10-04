"use client";

import { useId, useRef, useState } from "react";

const W = 1200;

/**
 * Giant, barely-there brand wordmark. On hover a gradient outline is revealed
 * around the cursor (Aceternity "Text Hover Effect" style).
 */
export function FooterWordmark({ text }: { text: string }) {
  const uid = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState(false);

  const fontSize = Math.min(200, W / (text.length * 0.56));
  const H = Math.round(fontSize * 1.1);
  const y = Math.round(fontSize * 0.86);
  const [pos, setPos] = useState({ x: W / 2, y: H / 2 });

  const common = {
    x: 0,
    y,
    textLength: W,
    lengthAdjust: "spacingAndGlyphs" as const,
    fontSize,
    fontWeight: 800,
    fontFamily: "var(--font-sans), system-ui, sans-serif",
  };

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden
      className="block h-auto w-full select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (r) setPos({ x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H });
      }}
    >
      <defs>
        <linearGradient id={`g${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={W} y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id={`r${uid}`} gradientUnits="userSpaceOnUse" r="230" cx={pos.x} cy={pos.y}>
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id={`m${uid}`}>
          <rect width={W} height={H} fill={`url(#r${uid})`} />
        </mask>
        <linearGradient id={`f${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.09" />
          <stop offset="100%" stopColor="white" stopOpacity="0.015" />
        </linearGradient>
      </defs>

      {/* resting state: faint fill */}
      <text {...common} fill={`url(#f${uid})`}>{text}</text>

      {/* hover state: gradient outline + soft glow, only around the cursor */}
      <g mask={`url(#m${uid})`} style={{ opacity: hover ? 1 : 0, transition: "opacity 300ms" }}>
        <text {...common} fill="rgb(56 189 248 / 0.10)" stroke={`url(#g${uid})`} strokeWidth={1.5}>
          {text}
        </text>
      </g>
    </svg>
  );
}

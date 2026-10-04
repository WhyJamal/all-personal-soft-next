"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const NAVY = "#0a1530";
const DEEP = "#14315e";
const BLUE = "#1f4a85";
const CREAM = "#f0e4bd";

/* ---------- Seigaiha (fon naqshi) ---------- */
function seigaiha(stroke: string, fill: string) {
  const centers = [[20, 0], [60, 0], [0, 20], [40, 20], [80, 20], [20, 40], [60, 40]];
  const rings = centers
    .map(([cx, cy]) =>
      [20, 15, 10, 5].map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join("")
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40" viewBox="0 0 80 40"><g fill="${fill}" stroke="${stroke}" stroke-width="1">${rings}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
const WAVES_BG = seigaiha("#8fb4e3", NAVY);

/* ---------- Kontur chiziqli to'lqin tepaliklari (tile) ---------- */
type LayerCfg = {
  w: number;
  h: number;
  amp: number;
  base: number;
  lines: number;
  gap: number;
  fill: string;
  stroke: string;
  phase: number;
  bottom: string;
  opacity: number;
  duration: number;
  dir: 1 | -1;
  bob: number;
};

function layerTile(c: LayerCfg) {
  const curve = (dy: number) => {
    const pts: string[] = [];
    for (let x = 0; x <= c.w; x += 6) {
      const t = (2 * Math.PI * x) / c.w;
      const y =
        c.base +
        dy +
        c.amp * Math.sin(t + c.phase) +
        c.amp * 0.35 * Math.sin(2 * t + c.phase * 2);
      pts.push(`${x},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };
  const body = `<polygon points="${curve(0)} ${c.w},${c.h} 0,${c.h}" fill="${c.fill}"/>`;
  const strokes = Array.from({ length: c.lines }, (_, k) => {
    const op = Math.max(0.15, 0.9 - k * 0.16);
    return `<polyline points="${curve(k * c.gap)}" fill="none" stroke="${c.stroke}" stroke-width="1.3" opacity="${op}"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${c.w}" height="${c.h}" viewBox="0 0 ${c.w} ${c.h}">${body}${strokes}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const LAYERS: LayerCfg[] = [
  { w: 520, h: 90, amp: 9, base: 24, lines: 4, gap: 8, fill: "#2f6199", stroke: "#cfe0f7", phase: 0.4, bottom: "20%", opacity: 0.45, duration: 95, dir: 1, bob: 6 },
  { w: 470, h: 90, amp: 10, base: 25, lines: 4, gap: 8, fill: "#2a5893", stroke: "#d8e6f8", phase: 1.3, bottom: "20%", opacity: 0.55, duration: 80, dir: -1, bob: 6 },
  { w: 420, h: 85, amp: 11, base: 24, lines: 4, gap: 8, fill: "#244f8a", stroke: "#e2ecf9", phase: 2.2, bottom: "12.5%", opacity: 0.65, duration: 66, dir: 1, bob: 5 },
  { w: 380, h: 80, amp: 11, base: 23, lines: 4, gap: 7, fill: "#1f4682", stroke: CREAM, phase: 3.1, bottom: "9%", opacity: 0.75, duration: 54, dir: -1, bob: 5 },
  { w: 340, h: 75, amp: 10, base: 22, lines: 3, gap: 7, fill: "#1a3d78", stroke: CREAM, phase: 3.9, bottom: "6.5%", opacity: 0.85, duration: 44, dir: 1, bob: 4 },
  { w: 300, h: 70, amp: 10, base: 20, lines: 3, gap: 7, fill: DEEP, stroke: CREAM, phase: 4.7, bottom: "4%", opacity: 0.92, duration: 36, dir: -1, bob: 4 },
  { w: 260, h: 65, amp: 9, base: 19, lines: 3, gap: 6, fill: "#0f2347", stroke: CREAM, phase: 5.4, bottom: "2%", opacity: 0.97, duration: 29, dir: 1, bob: 3 },
  { w: 230, h: 60, amp: 8, base: 17, lines: 3, gap: 6, fill: NAVY, stroke: CREAM, phase: 6.0, bottom: "0%", opacity: 1, duration: 23, dir: -1, bob: 3 },
];

const TILES = LAYERS.map(layerTile);

function WaveLayer({ c, tile }: { c: LayerCfg; tile: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className="absolute inset-x-0"
      style={{
        bottom: c.bottom,
        height: c.h,
        opacity: c.opacity,
        backgroundImage: tile,
        backgroundSize: `${c.w}px ${c.h}px`,
        backgroundRepeat: "repeat-x",
      }}
      animate={
        reduce
          ? undefined
          : {
            backgroundPositionX: c.dir === 1 ? ["0px", `${c.w}px`] : [`${c.w}px`, "0px"],
            y: [0, -c.bob, 0],
          }
      }
      transition={{
        backgroundPositionX: { duration: c.duration, repeat: Infinity, ease: "linear" },
        y: { duration: 5 + c.bob * 0.5, repeat: Infinity, ease: "easeInOut" },
      }}
    />
  );
}

/* ---------- Burilgan to'lqin toji (ko'pik barmoqlari bilan) ---------- */
const FOAM_PTS: [number, number][] = [
  [92, 40], [116, 28], [141, 21], [166, 18], [191, 21],
  [214, 29], [235, 41], [251, 57], [259, 75],
];
const DROPS: [number, number][] = [
  [226, 108], [214, 124], [238, 116], [204, 140], [247, 100], [196, 112],
];

function Crest({
  className,
  flip,
  duration = 8,
  delay = 0,
}: {
  className?: string;
  flip?: boolean;
  duration?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 300 260"
      className={cn("absolute aspect-300/260", flip && "-scale-x-100", className)}
      style={{ transformOrigin: "0% 100%", overflow: "visible" }}
      animate={reduce ? undefined : { y: [0, -9, 0], rotate: [0, -1.4, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* tana */}
      <path
        d="M0 260 L0 150 C30 120 70 40 140 22 C195 10 245 35 262 75 C240 62 215 64 200 82 C185 100 190 140 215 175 C235 205 265 235 300 245 L300 260 Z"
        fill={BLUE}
        stroke={CREAM}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* ichki chuqurlik */}
      <path
        d="M205 92 C190 115 196 150 222 180 C240 202 268 228 300 238 L300 250 C262 240 230 215 212 190 C192 160 186 120 205 92 Z"
        fill={DEEP}
      />
      {/* kontur chiziqlari */}
      <g fill="none" stroke={CREAM} strokeWidth="1.3" strokeLinecap="round">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <path
            key={k}
            d={`M0 ${200 + k * 9} C${34 + k * 6} ${168 + k * 9} ${74 + k * 7} ${96 + k * 10} ${128 + k * 6} ${66 + k * 9}`}
            opacity={0.7 - k * 0.1}
          />
        ))}
      </g>
      {/* ko'pik */}
      <g fill={CREAM}>
        {FOAM_PTS.map(([cx, cy], i) => (
          <motion.g
            key={i}
            animate={reduce ? undefined : { y: [0, -3 - (i % 3), 0] }}
            transition={{ duration: 2.4 + (i % 4) * 0.45, delay: i * 0.15, repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx={cx} cy={cy} r={9 + (i % 3) * 2} />
            <circle cx={cx + 7 + (i % 2) * 4} cy={cy - 8 - (i % 3) * 2} r={5} />
            <circle cx={cx - 4} cy={cy - 11} r={4} />
            <circle cx={cx + 12} cy={cy + 2} r={3.5} />
          </motion.g>
        ))}
      </g>
      {/* tomchilar */}
      <g fill={CREAM}>
        {DROPS.map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r={2.4}
            animate={reduce ? undefined : { opacity: [0.2, 1, 0.2], y: [0, 6, 0] }}
            transition={{ duration: 2.6, delay: i * 0.35, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </g>
    </motion.svg>
  );
}

/* ---------- Aurora blob ---------- */
function Blob({
  className,
  x,
  y,
  duration,
}: {
  className: string;
  x: number;
  y: number;
  duration: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={cn("absolute rounded-full blur-3xl", className)}
      animate={reduce ? undefined : { x, y }}
      transition={{ duration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
    />
  );
}

/* ---------- Sakura yaproqlari ---------- */
const PETALS = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37 + 5) % 100,
  size: 6 + ((i * 5) % 8),
  delay: (i * 0.4) % 6,
  duration: 6 + ((i * 3) % 5), // 6–10s
  sway: (i % 2 ? 1 : -1) * (40 + ((i * 13) % 50)),
  pink: i % 3 === 0 ? "bg-rose-200/60" : i % 3 === 1 ? "bg-pink-200/55" : "bg-pink-100/50",
}));

function Petal({ p }: { p: (typeof PETALS)[number] }) {
  return (
    <motion.span
      aria-hidden
      className={cn("absolute rounded-[80%_0_80%_0]", p.pink)}
      style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.75 }}
      initial={{ top: "-6%", opacity: 0 }}
      animate={{
        top: ["-6%", "106%"],
        x: [0, p.sway, -p.sway / 2, p.sway * 1.4],
        rotate: [0, 200, 400, 640],
        opacity: [0, 0.85, 0.85, 0],
      }}
      transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
    />
  );
}

/** Dark cover — Hokusai uslubidagi kontur to'lqinlar, qizil quyosh va sakura yomg'iri. */
export function Backdrop() {
  const reduce = useReducedMotion();
  const edgeMask = "radial-gradient(ellipse at center, transparent 10%, #000 90%)";

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[28px] bg-[#0a1530]">
      {/* Aurora */}
      <Blob className="-left-10 -top-28 size-80 bg-indigo-500/40" x={70} y={30} duration={9} />
      <Blob className="-bottom-36 right-0 size-96 bg-sky-600/25" x={-60} y={-20} duration={11} />
      <Blob className="left-1/3 top-8 size-60 bg-amber-300/10" x={50} y={40} duration={13} />

      {/* Seigaiha fon naqshi */}
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: WAVES_BG,
          backgroundSize: "80px 40px",
          maskImage: edgeMask,
          WebkitMaskImage: edgeMask,
        }}
        animate={reduce ? undefined : { backgroundPositionX: ["0px", "80px"] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />

      {/* Quyosh */}
      <div className="absolute right-0 top-[16%] size-40">
        {/* Aylanuvchi nurlar (Rising Sun) */}
        {!reduce && (
          <motion.div
            aria-hidden
            className="absolute -inset-16 rounded-full opacity-30"
            style={{
              background:
                "repeating-conic-gradient(from 0deg, rgba(248,113,113,0.55) 0deg 5deg, transparent 5deg 15deg)",
              maskImage: "radial-gradient(circle, transparent 28%, #000 40%, transparent 72%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 28%, #000 40%, transparent 72%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Tarqaluvchi halqalar */}
        {!reduce &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute inset-0 rounded-full border border-red-500/40"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: [1, 2.6], opacity: [0.5, 0] }}
              transition={{ duration: 7, delay: i * 2.3, repeat: Infinity, ease: "easeOut" }}
            />
          ))}

        {/* Quyosh disk — ko'tarilib-tushadi, nafas oladi */}
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full bg-red-700 shadow-[0_0_100px_28px_rgba(220,38,38,0.4)]"
          animate={reduce ? undefined : { y: [16, -14, 16], scale: [1, 1.06, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Orqa qatlamlar */}
      {LAYERS.slice(0, 4).map((c, i) => (
        <WaveLayer key={i} c={c} tile={TILES[i]} />
      ))}

      {/* Uzoqdagi to'lqin tojlari */}
      <Crest flip duration={10} delay={1} className="right-3 bottom-[12%] h-[50%] opacity-70" />
      <Crest duration={11} delay={3} className="left-10 bottom-[11%] h-[55%] opacity-55" />

      {/* O'rta qatlamlar */}
      {LAYERS.slice(4, 6).map((c, i) => (
        <WaveLayer key={i} c={c} tile={TILES[i + 4]} />
      ))}

      {/* Asosiy to'lqin tojlari */}
      <Crest duration={8} className="-bottom-3 -left-8 h-[32%]" />
      <Crest flip duration={9.5} delay={2} className="bottom-4 -right-6 h-[50%]" />

      <Crest duration={8} className="top-20 -left-8 h-[32%]" />

      {/* Eng old qatlamlar */}
      {LAYERS.slice(6).map((c, i) => (
        <WaveLayer key={i} c={c} tile={TILES[i + 6]} />
      ))}

      {/* Asosiy to'lqin tojlari */}
      <Crest duration={8} className="-bottom-4 -left-10 h-[60%]" />
      <Crest flip duration={9.5} delay={2} className="-bottom-6 -right-32 h-[50%]" />

      {/* Eng old qatlam */}
      <WaveLayer c={LAYERS[4]} tile={TILES[4]} />

      {/* Sakura yaproqlari */}
      {!reduce && PETALS.map((p, i) => <Petal key={i} p={p} />)}

      {/* Tepadan tuman (matn o'qilishi uchun) */}
      {/* <div className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-[#0a1530]/70 to-transparent" /> */}

      {/* Pastki oltin chiziq */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-amber-300/50 to-transparent" />
    </div>
  );
}
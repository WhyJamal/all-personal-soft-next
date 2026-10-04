import type { Product } from "@/lib/api/types";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500";

export const btnPrimary = `inline-flex h-11 items-center justify-center gap-2 rounded-full bg-sky-600 px-6 text-sm font-semibold text-white shadow-md shadow-sky-600/25 transition-colors hover:bg-sky-700 ${focus}`;

export const btnSecondary = `inline-flex h-11 items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white/80 px-6 text-sm font-semibold text-zinc-900 backdrop-blur transition-colors hover:bg-white ${focus}`;

export const eyebrow = "text-xs font-semibold uppercase tracking-[0.14em] text-sky-700";

export const sectionTitle =
  "mt-3 text-3xl font-semibold tracking-tight text-zinc-900 text-balance md:text-4xl";

/** Soft diagonal wash used on cards */
export const linearGradient = (g: Product["gradient"]) =>
  `linear-gradient(135deg, ${g[0]}, ${g[1]}, ${g[2]})`;

/** Layered radial wash used behind the product hero */
export const meshGradient = (g: Product["gradient"]) =>
  `radial-gradient(60% 70% at 12% 8%, ${g[0]} 0%, transparent 70%), radial-gradient(55% 65% at 92% 18%, ${g[2]} 0%, transparent 70%), ${g[1]}`;

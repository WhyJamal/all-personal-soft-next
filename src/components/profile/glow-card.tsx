"use client";

import type { ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/** Aceternity-style spotlight card: a soft light follows the cursor inside the card. */
export function GlowCard({
  children,
  className,
  dark = false,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  const x = useMotionValue(-300);
  const y = useMotionValue(-300);
  const color = dark ? "rgb(56 189 248 / 0.22)" : "rgb(14 165 233 / 0.10)";
  const glow = useMotionTemplate`radial-gradient(280px circle at ${x}px ${y}px, ${color}, transparent 75%)`;

  return (
    <div
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border",
        dark ? "border-zinc-800 bg-zinc-950 text-white" : "border-zinc-200 bg-white text-zinc-900",
        className
      )}
    >
      <motion.div
        aria-hidden
        style={{ background: glow }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

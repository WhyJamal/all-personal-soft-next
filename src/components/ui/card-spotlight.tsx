"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** rgb triplet for the glow, e.g. "14 165 233" */
  color?: string;
  radius?: number;
};

/** Aceternity-style "Card Spotlight": a soft radial glow follows the cursor inside the card. */
export function CardSpotlight({ children, className, color = "14 165 233", radius = 260, ...rest }: Props) {
  const reduce = useReducedMotion();
  const x = useMotionValue(-radius);
  const y = useMotionValue(-radius);
  const glow = useMotionTemplate`radial-gradient(${radius}px circle at ${x}px ${y}px, rgb(${color} / 0.14), transparent 80%)`;

  return (
    <div
      className={cn("group/spot relative overflow-hidden", className)}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onMouseLeave={() => {
        x.set(-radius);
        y.set(-radius);
      }}
      {...rest}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{ background: glow }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

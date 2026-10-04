"use client";

import { Children, isValidElement, useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type HoverEffectProps = {
  /** Each child becomes one grid cell */
  children: ReactNode;
  /** Grid classes, e.g. "grid-cols-1 md:grid-cols-3" */
  className?: string;
  /** Overrides the glow that follows the cursor between cells */
  glowClassName?: string;
};

/**
 * Aceternity-style "Card Hover Effect": a soft glow slides between cells as the
 * pointer (or keyboard focus) moves, and cells rise in with a short stagger.
 * Children are passed as nodes, so it can be fed from Server Components.
 */
export function HoverEffect({ children, className, glowClassName }: HoverEffectProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);
  const items = Children.toArray(children);

  return (
    <div className={cn("grid", className)}>
      {items.map((child, i) => (
        <motion.div
          key={isValidElement(child) && child.key !== null ? child.key : i}
          className="relative p-2"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(i)}
          onBlur={() => setHovered(null)}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: reduce ? 0 : Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence>
            {hovered === i && !reduce && (
              <motion.span
                layoutId={`${id}-glow`}
                className={cn("absolute inset-0 rounded-3xl bg-sky-100/80", glowClassName)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
              />
            )}
          </AnimatePresence>
          <div className="relative z-10 h-full">{child}</div>
        </motion.div>
      ))}
    </div>
  );
}

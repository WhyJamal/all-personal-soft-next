"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  words: string;
  className?: string;
  /** Seconds between two words appearing */
  stagger?: number;
};

/** Aceternity-style "Text Generate Effect": words fade in one by one, un-blurring as they land. */
export function TextGenerateEffect({ words, className, stagger = 0.07 }: Props) {
  const reduce = useReducedMotion();
  const list = words.split(" ");

  return (
    <span className={cn(className)} aria-label={words}>
      {list.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={reduce ? false : { opacity: 0, filter: "blur(8px)", y: 6 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.5, delay: reduce ? 0 : 0.15 + i * stagger, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}
          {i < list.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}

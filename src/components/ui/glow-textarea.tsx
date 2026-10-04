"use client";

import { useState, type TextareaHTMLAttributes } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  /** Shown bottom-right, e.g. "12 / 2000" */
  counter?: string;
};

/** Same cursor-following glow as AuthInput, for multi-line text. */
export function GlowTextarea({ label, error, counter, className, id, ...props }: Props) {
  const [hover, setHover] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(${hover ? 110 : 0}px circle at ${x}px ${y}px, rgb(14 165 233 / 0.45), transparent 80%)`;
  const fieldId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <motion.div
        style={{ background: glow }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - r.left);
          y.set(e.clientY - r.top);
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="rounded-xl p-0.5 transition-all duration-300"
      >
        <textarea
          id={fieldId}
          aria-invalid={!!error}
          className={cn(
            "block min-h-32 w-full resize-y rounded-[10px] border border-zinc-200 bg-white px-3.5 py-3 text-sm leading-6 text-zinc-900 outline-none transition-colors",
            "placeholder:text-zinc-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10",
            "aria-invalid:border-red-400 aria-invalid:focus:ring-red-500/10",
            className
          )}
          {...props}
        />
      </motion.div>
      <div className="flex items-start justify-between gap-3">
        {error ? (
          <p role="alert" className="text-xs text-red-500">
            {error}
          </p>
        ) : (
          <span />
        )}
        {counter && <span className="shrink-0 text-xs tabular-nums text-zinc-400">{counter}</span>}
      </div>
    </div>
  );
}

"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  /** Right-side slot, e.g. show/hide password button */
  trailing?: ReactNode;
};

/** Aceternity-style input: a sky glow follows the cursor on hover. */
export function AuthInput({ label, error, hint, trailing, className, id, ...props }: Props) {
  const [hover, setHover] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(${hover ? 90 : 0}px circle at ${x}px ${y}px, rgb(14 165 233 / 0.45), transparent 80%)`;
  const inputId = id ?? props.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-zinc-700">
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
        className="group/input rounded-xl p-0.5 transition-all duration-300"
      >
        <div className="relative">
          <input
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "h-11 w-full rounded-[10px] border border-zinc-200 bg-white px-3.5 text-sm text-zinc-900 outline-none transition-colors",
              "placeholder:text-zinc-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10",
              "aria-invalid:border-red-400 aria-invalid:focus:ring-red-500/10",
              trailing && "pr-11",
              className
            )}
            {...props}
          />
          {trailing && <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>}
        </div>
      </motion.div>
      {error ? (
        <p role="alert" className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

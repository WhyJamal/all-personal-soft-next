"use client";

import { useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only stars, or an interactive 1–5 picker when `onChange` is given. */
export function StarRating({
  value,
  onChange,
  size = 18,
  className,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
}) {
  const t = useTranslations("reviews");
  const [hover, setHover] = useState(0);
  const shown = onChange ? hover || value : value;

  const star = (n: number) => (
    <Star
      style={{ width: size, height: size }}
      className={cn("transition-all duration-150", n <= shown ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-300")}
    />
  );

  if (!onChange) {
    return (
      <div role="img" aria-label={t("stars", { count: value })} className={cn("inline-flex gap-0.5", className)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n}>{star(n)}</span>
        ))}
      </div>
    );
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") onChange?.(Math.min(5, value + 1));
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") onChange?.(Math.max(1, value - 1));
  }

  return (
    <div role="radiogroup" aria-label={t("yourRating")} onKeyDown={onKeyDown} onMouseLeave={() => setHover(0)} className={cn("inline-flex gap-1", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={t("stars", { count: n })}
          tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n)}
          className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-sky-500 active:scale-95"
        >
          {star(n)}
        </button>
      ))}
    </div>
  );
}

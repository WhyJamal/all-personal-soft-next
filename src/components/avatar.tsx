"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Round avatar with an initial as fallback (also used when the image fails to load). */
export function Avatar({ name, src, className }: { name?: string | null; src?: string | null; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initial = (name?.trim()[0] ?? "?").toUpperCase();

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full bg-linear-to-br from-sky-500 to-indigo-600 font-semibold text-white",
        className
      )}
    >
      {src && failedSrc !== src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" onError={() => setFailedSrc(src)} />
      ) : (
        initial
      )}
    </span>
  );
}

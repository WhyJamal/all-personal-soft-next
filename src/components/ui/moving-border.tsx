"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

function MovingBorder({
  children,
  duration,
  radius,
}: {
  children: ReactNode;
  duration: number;
  radius: number;
}) {
  const pathRef = useRef<SVGRectElement | null>(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) progress.set((time * (length / duration)) % length);
  });

  const x = useTransform(progress, (v) => pathRef.current?.getPointAtLength(v).x ?? 0);
  const y = useTransform(progress, (v) => pathRef.current?.getPointAtLength(v).y ?? 0);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        aria-hidden
      >
        <rect fill="none" width="100%" height="100%" rx={radius} ry={radius} ref={pathRef} />
      </svg>
      <motion.div style={{ position: "absolute", top: 0, left: 0, display: "inline-block", transform }}>
        {children}
      </motion.div>
    </>
  );
}

type MovingBorderCardProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  /** Corner radius in px */
  radius?: number;
  /** Milliseconds for one lap */
  duration?: number;
};

/** Aceternity-style "Moving Border": a light that travels around the card edge. */
export function MovingBorderCard({
  children,
  className,
  containerClassName,
  radius = 24,
  duration = 5000,
}: MovingBorderCardProps) {
  const reduce = useReducedMotion();

  return (
    <div
      className={cn("relative overflow-hidden p-px", containerClassName)}
      style={{ borderRadius: radius }}
    >
      {reduce ? (
        <div className="absolute inset-0 bg-sky-500" />
      ) : (
        <div className="absolute inset-0" style={{ borderRadius: radius }}>
          <MovingBorder duration={duration} radius={radius}>
            <div className="h-28 w-28 bg-[radial-gradient(#0ea5e9_40%,transparent_60%)] opacity-90" />
          </MovingBorder>
        </div>
      )}
      <div
        className={cn("relative h-full bg-white", className)}
        style={{ borderRadius: radius - 1 }}
      >
        {children}
      </div>
    </div>
  );
}

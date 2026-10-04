"use client";

import { motion } from "motion/react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[400px] rounded-3xl border border-zinc-200/80 bg-white/80 p-7 shadow-[0_20px_60px_-20px_rgb(2_132_199/0.25)] backdrop-blur-xl sm:p-8"
    >
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

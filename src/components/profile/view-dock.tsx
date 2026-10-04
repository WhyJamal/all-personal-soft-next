"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ViewMode } from "./use-view-mode";

/** Floating glass dock at the bottom of the screen: list/grid switch + quick "create base". */
export function ViewDock({ show, view, onChange }: { show: boolean; view: ViewMode; onChange: (v: ViewMode) => void }) {
  const t = useTranslations("manage");
  const items = [
    { id: "list" as const, icon: List, label: t("view.list") },
    { id: "grid" as const, icon: LayoutGrid, label: t("view.grid") },
  ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 28, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]"
        >
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-zinc-950/85 p-1.5 shadow-2xl shadow-zinc-950/30 backdrop-blur-xl">
            {items.map(({ id, icon: Icon, label }) => {
              const on = view === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onChange(id)}
                  aria-pressed={on}
                  aria-label={label}
                  title={label}
                  className="relative flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium focus-visible:outline-2 focus-visible:outline-sky-400"
                >
                  {on && (
                    <motion.span
                      layoutId="dock-pill"
                      className="absolute inset-0 rounded-full bg-white/15"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                    />
                  )}
                  <Icon className={cn("relative size-4 transition-colors", on ? "text-white" : "text-zinc-400")} />
                  <span className={cn("relative hidden sm:inline", on ? "text-white" : "text-zinc-400")}>{label}</span>
                </button>
              );
            })}

            <span aria-hidden className="mx-1 h-5 w-px bg-white/15" />

            <Link
              href="/products"
              aria-label={t("bases.create")}
              title={t("bases.create")}
              className="flex h-10 items-center gap-1.5 rounded-full bg-sky-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-sky-400"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">{t("bases.create")}</span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

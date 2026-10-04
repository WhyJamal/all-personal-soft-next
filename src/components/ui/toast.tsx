"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "success" | "error" | "info";
type Item = { id: number; message: string; kind: Kind };

const Ctx = createContext<{ toast: (message: string, kind?: Kind) => void } | null>(null);

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const ICON = { success: CheckCircle2, error: XCircle, info: Info };
const TONE = { success: "text-emerald-500", error: "text-red-500", info: "text-sky-500" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const next = useRef(0);

  const toast = useCallback((message: string, kind: Kind = "success") => {
    const id = ++next.current;
    setItems((s) => [...s.slice(-2), { id, message, kind }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), kind === "error" ? 5000 : 3000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-100 flex flex-col items-center gap-2 px-4">
        <AnimatePresence initial={false}>
          {items.map((i) => {
            const Icon = ICON[i.kind];
            return (
              <motion.div
                key={i.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white/95 px-4 py-3 text-sm text-zinc-800 shadow-xl shadow-zinc-900/10 backdrop-blur"
              >
                <Icon className={cn("size-4 shrink-0", TONE[i.kind])} />
                {i.message}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

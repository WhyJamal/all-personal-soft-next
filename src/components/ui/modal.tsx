"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const noop = () => () => {};
const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  closable = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** e.g. "max-w-xl" */
  className?: string;
  /** false while something must not be interrupted (hides ✕, ignores Esc and backdrop) */
  closable?: boolean;
}) {
  const mounted = useMounted();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closable && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, closable]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-90 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closable ? onClose : undefined}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl",
              "max-w-md",
              className
            )}
          >
            <div className="flex items-center justify-between gap-4 px-6 pb-2 pt-5">
              <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
              {closable && (
                <button
                  type="button"
                  onClick={onClose}
                  className="grid size-8 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="overflow-y-auto px-6 pb-6 pt-2">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const t = useTranslations("manage.common");
  return (
    <Modal open={open} onClose={onClose} title={title ?? t("confirm")} className="max-w-sm">
      <p className="text-sm leading-relaxed text-zinc-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            onConfirm();
          }}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors",
            danger ? "bg-red-600 hover:bg-red-500" : "bg-sky-600 hover:bg-sky-500"
          )}
        >
          {confirmLabel ?? t("confirm")}
        </button>
      </div>
    </Modal>
  );
}

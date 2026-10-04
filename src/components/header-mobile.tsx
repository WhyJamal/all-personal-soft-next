"use client";

import { useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, LogOut, UserRound } from "lucide-react";
import { headerConfig } from "@/config/header.config";
import { Avatar } from "./avatar";
import { LanguageSwitcher } from "./language-switcher";

export type MobileLink = { href: string; label: string };

/** Slide-down menu for screens below md. Rendered inside the fixed header. */
export function MobileMenu({ open, onClose, links }: { open: boolean; onClose: () => void; links: MobileLink[] }) {
  const { data: session, status } = useSession();
  const t = useTranslations("header");
  const tc = useTranslations("common");
  const ta = useTranslations("auth.menu");
  const { actions } = headerConfig;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const user = session?.user;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            aria-hidden
            className="fixed inset-x-0 bottom-0 top-12 bg-zinc-950/40 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-3rem)] overflow-y-auto rounded-b-3xl border-b border-black/5 bg-white px-4 pb-6 pt-2 shadow-2xl shadow-zinc-900/10 md:hidden"
          >
            <ul>
              {links.map((l, i) => (
                <motion.li
                  key={l.href + l.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i + 0.05 }}
                >
                  <Link
                    href={l.href}
                    onClick={onClose}
                    className="flex items-center justify-between border-b border-zinc-100 py-3.5 text-[17px] font-medium text-zinc-900 active:bg-zinc-50"
                  >
                    {l.label}
                    <ChevronRight className="size-4 text-zinc-300" />
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-sm text-zinc-500">{tc("language")}</span>
              <LanguageSwitcher scrolled />
            </div>

            <div className="mt-5">
              {status === "authenticated" && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-3">
                    <Avatar name={user.name} src={user.image} className="size-10 text-sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">{user.name}</p>
                      <p className="truncate text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/profile"
                      onClick={onClose}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-semibold text-white"
                    >
                      <UserRound className="size-4" />
                      {ta("profile")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700"
                    >
                      <LogOut className="size-4" />
                      {ta("logout")}
                    </button>
                  </div>
                </div>
              ) : (
                status !== "loading" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href={actions.signIn.href}
                      onClick={onClose}
                      className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-800"
                    >
                      {t(actions.signIn.labelKey)}
                    </Link>
                    <Link
                      href={actions.getStarted.href}
                      onClick={onClose}
                      className="flex h-11 items-center justify-center rounded-xl bg-sky-600 text-sm font-semibold text-white shadow-md shadow-sky-600/25"
                    >
                      {t(actions.getStarted.labelKey)}
                    </Link>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

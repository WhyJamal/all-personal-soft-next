"use client";

import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";

export function UserMenu({ scrolled }: { scrolled: boolean }) {
  const { data: session } = useSession();
  const t = useTranslations("auth.menu");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const user = session?.user;
  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("account")}
        className={cn(
          "rounded-full p-0.5 ring-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
          scrolled ? "ring-zinc-200 hover:ring-sky-300" : "ring-white/40 hover:ring-white/80"
        )}
      >
        <Avatar name={user.name} src={user.image} className="size-7" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-60 origin-top-right rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl shadow-zinc-900/10"
          >
            <div className="flex items-center gap-3 px-2.5 py-2.5">
              <Avatar name={user.name} src={user.image} className="size-9" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">{user.name}</p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-zinc-100" />
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              <UserRound className="size-4" />
              {t("profile")}
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-red-600"
            >
              <LogOut className="size-4" />
              {t("logout")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { headerConfig } from "@/config/header.config";
import { UserMenu } from "./user-menu";

const { actions } = headerConfig;

/** Right side of the header: Sign in / Get started, or the user menu when signed in. */
export function HeaderAuth({ scrolled }: { scrolled: boolean }) {
  const { status } = useSession();
  const t = useTranslations("header");

  // Reserve the space while the session loads, so nothing jumps
  if (status === "loading") return <div aria-hidden className="hidden h-7 w-16 md:block" />;
  if (status === "authenticated") return <UserMenu scrolled={scrolled} />;

  return (
    <>
      <Link
        href={actions.signIn.href}
        className={cn(
          "hidden text-xs font-medium transition-colors duration-300 lg:block",
          scrolled ? "text-zinc-600 hover:text-zinc-900" : "text-white/90 hover:text-white"
        )}
      >
        {t(actions.signIn.labelKey)}
      </Link>
      <Link
        href={actions.getStarted.href}
        className={cn(
          "hidden rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition-colors duration-300 md:block",
          scrolled ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-white text-sky-700 hover:bg-white/90"
        )}
      >
        {t(actions.getStarted.labelKey)}
      </Link>
    </>
  );
}

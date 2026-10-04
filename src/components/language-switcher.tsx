"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { locales, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/actions";

export function LanguageSwitcher({ scrolled }: { scrolled: boolean }) {
  const current = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === current) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn(
        "flex items-center rounded-full p-0.5 text-[11px] font-semibold transition-colors duration-300",
        scrolled ? "bg-zinc-900/5" : "bg-white/15",
        pending && "opacity-60"
      )}
    >
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => change(l)}
          aria-pressed={l === current}
          className={cn(
            "rounded-full px-1.5 py-0.5 uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
            l === current
              ? scrolled
                ? "bg-sky-600 text-white"
                : "bg-white text-sky-700"
              : scrolled
                ? "text-zinc-600 hover:text-zinc-900"
                : "text-white/80 hover:text-white"
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
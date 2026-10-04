"use client";

import { useTranslations } from "next-intl";
import { PERIODS } from "@/config/billing.config";
import { cn } from "@/lib/utils";

/** Pill row for the payment term: 1 / 3 / 6 / 12 / 24 months. */
export function PeriodPicker({ value, onChange }: { value: number; onChange: (months: number) => void }) {
  const t = useTranslations("manage.period");

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-zinc-700">{t("title")}</p>
      <div role="group" aria-label={t("title")} className="flex flex-wrap gap-2">
        {PERIODS.map((m) => {
          const on = m === value;
          return (
            <button
              key={m}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(m)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
                on
                  ? "border-sky-500 bg-sky-50 font-medium text-sky-700 shadow-[0_0_0_3px_rgb(14_165_233/0.12)]"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
              )}
            >
              {t("months", { count: m })}
            </button>
          );
        })}
      </div>
    </div>
  );
}

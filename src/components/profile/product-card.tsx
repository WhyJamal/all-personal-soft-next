"use client";

import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ProfileProduct } from "@/lib/profile/types";
import { daysLeft, formatDate, progressOf, statusOf, type Status } from "./format";
import { HoverEffect } from "../ui/hover-effect";

const PILL: Record<Status, string> = {
  active: "bg-emerald-50 text-emerald-700",
  expiring: "bg-amber-50 text-amber-700",
  expired: "bg-zinc-100 text-zinc-500",
};
const DOT: Record<Status, string> = { active: "bg-emerald-500", expiring: "bg-amber-500", expired: "bg-zinc-400" };
const BAR: Record<Status, string> = { active: "bg-sky-500", expiring: "bg-amber-500", expired: "bg-zinc-300" };

export function ProductCard({ product, now }: { product: ProfileProduct; now: number }) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const status = statusOf(product.end, now);
  const progress = progressOf(product.start, product.end, now);
  const meta = [product.plan, product.productName, product.version && `v${product.version}`].filter(Boolean).join(" · ");

  return (
      <article className="relative z-10 h-full rounded-3xl border border-zinc-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-sky-500 to-indigo-600 text-sm font-semibold text-white">
            {(product.title.trim()[0] ?? "?").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-zinc-900">{product.title}</h3>
            <p className="truncate text-xs text-zinc-500">{meta}</p>
          </div>
          <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium", PILL[status])}>
            <span className={cn("size-1.5 rounded-full", DOT[status])} />
            {t(`products.status.${status}`)}
          </span>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <div className={cn("h-full rounded-full", BAR[status])} style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
          <span>
            {t("products.until", { date: formatDate(product.end, locale) })}
            {status !== "expired" && <span className="text-zinc-400"> · {t("days", { count: daysLeft(product.end, now) })}</span>}
          </span>
          {product.url && (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-sky-600 transition-colors hover:text-sky-500"
            >
              {t("products.open")}
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </article>
  );
}

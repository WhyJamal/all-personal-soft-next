"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Database } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileProduct } from "@/lib/profile/types";
import { BaseList, type BaseFilter } from "./base-list";
import { OrgCta } from "./org-cta";
import type { ViewMode } from "./use-view-mode";

const FILTERS: BaseFilter[] = ["all", "active", "expired"];

export function ProductsPanel({
  products,
  now,
  hasOrg,
  view,
  balance,
  orgInn,
}: {
  products: ProfileProduct[];
  now: number;
  hasOrg: boolean;
  view: ViewMode;
  balance: number;
  orgInn: string;
}) {
  const t = useTranslations("profile.products");
  const tm = useTranslations("manage.bases");
  const [filter, setFilter] = useState<BaseFilter>("all");

  if (!hasOrg) return <OrgCta />;

  // Remount the list when server data changes, so it always starts from the saved state
  const signature = products.map((p) => `${p.id}:${p.order}:${p.chosen}:${p.title}`).join("|");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="group" className="inline-flex rounded-full bg-zinc-100 p-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className="relative rounded-full px-3.5 py-1 text-xs font-medium"
            >
              {filter === f && (
                <motion.span
                  layoutId="products-filter"
                  className="absolute inset-0 rounded-full bg-white shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
                />
              )}
              <span className={cn("relative", filter === f ? "text-zinc-900" : "text-zinc-500")}>{t(f)}</span>
            </button>
          ))}
        </div>

      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-zinc-200 py-16 text-center">
          <span className="grid size-11 place-items-center rounded-2xl bg-zinc-100 text-zinc-400">
            <Database className="size-5" />
          </span>
          <p className="text-sm font-medium text-zinc-700">{tm("empty")}</p>
          <p className="text-xs text-zinc-400">{tm("emptyHint")}</p>
        </div>
      ) : (
        <BaseList key={signature} products={products} now={now} filter={filter} view={view} balance={balance} orgInn={orgInn} />
      )}
    </div>
  );
}

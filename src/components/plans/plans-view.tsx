"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MovingBorderCard } from "@/components/ui/moving-border";
import { HoverEffect } from "@/components/ui/hover-effect";
import type { FeatureValue, PlanFeatureRow } from "@/lib/plans/server";
import { btnPrimary, btnSecondary } from "@/components/products/styles";
import { PlanChooseButton, StartBaseProvider } from "@/components/bases/start-base";
import { PERIODS } from "@/config/billing.config";
import { isMonthly } from "@/lib/price";

type PlanItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  highlight: boolean;
};
type ProductItem = {
  id: number;
  slug: string;
  title: string;
  icon: string | null;
  isActive: boolean;
  includedUsers: number;
  extraUserPrice: number;
  plans: PlanItem[];
};

function Segmented<T extends string | number>({
  id,
  items,
  value,
  onChange,
}: {
  id: string;
  items: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" className="inline-flex max-w-full overflow-x-auto rounded-full bg-zinc-100 p-1">
      {items.map((it) => {
        const on = it.value === value;
        return (
          <button
            key={String(it.value)}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(it.value)}
            className="relative shrink-0 rounded-full px-4 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-sky-500"
          >
            {on && (
              <motion.span
                layoutId={id}
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
              />
            )}
            <span className={cn("relative whitespace-nowrap", on ? "text-zinc-900" : "text-zinc-500")}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Cell({ value }: { value: FeatureValue }) {
  if (typeof value === "boolean") {
    return value ? <Check className="mx-auto size-4 text-emerald-600" strokeWidth={2.5} /> : <Minus className="mx-auto size-4 text-zinc-300" />;
  }
  return <span className="text-sm font-medium text-zinc-800">{value}</span>;
}

export function PlansView({ products, features }: { products: ProductItem[]; features: PlanFeatureRow[] }) {
  const t = useTranslations("plans");
  const tp = useTranslations("products");
  const format = useFormatter();
  const [productId, setProductId] = useState(products[0]?.id ?? 0);
  const [period, setPeriod] = useState(1);

  const product = products.find((p) => p.id === productId);
  const plans = product?.plans ?? [];

  // Exactly what the server charges: a 30-day plan is bought `period` times; any other plan is bought as it is.
  const termFor = (pl: PlanItem) => (isMonthly(pl.durationDays) ? period : 1);
  const priceFor = (pl: PlanItem) => pl.price * termFor(pl);
  const money = (n: number) => tp("card.price", { amount: format.number(n, { maximumFractionDigits: 0 }) });

  const columns = plans.slice(0, 3); // the feature matrix has three tier columns

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-12 md:px-6 md:pt-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 text-balance md:text-5xl">{t("title")}</h1>
        <p className="mt-4 text-base text-zinc-500 md:text-lg">{t("subtitle")}</p>
      </div>

      {products.length === 0 ? (
        <p className="mt-14 rounded-3xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500">{t("empty")}</p>
      ) : (
        <>
          <div className="mt-10 flex flex-col items-center gap-5">
            {products.length > 1 && (
              <Segmented id="plans-product" items={products.map((p) => ({ value: p.id, label: p.title }))} value={productId} onChange={setProductId} />
            )}
            {product && (
              <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
                <span className="text-sky-600">{product.title}</span>
              </h2>
            )}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-zinc-400">{t("period")}</span>
              <Segmented id="plans-period" items={PERIODS.map((p) => ({ value: p, label: t("months", { count: p }) }))} value={period} onChange={setPeriod} />
            </div>
          </div>

          {product && (
            <StartBaseProvider key={product.id} product={product}>
              <HoverEffect
                key={`${productId}`}
                className={cn(
                  "mt-12 grid-cols-1",
                  plans.length === 1 && "mx-auto max-w-md",
                  plans.length === 2 && "mx-auto max-w-3xl md:grid-cols-2",
                  plans.length >= 3 && "md:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {plans.map((pl) => {
                  const body = (
                    <div className="flex h-full flex-col p-7">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-sky-600">{product!.title}</p>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">{pl.name}</h3>
                      </div>
                        {pl.highlight && <span className="rounded-full bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white">{t("recommended")}</span>}
                      </div>

                      <div className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
                        <span className="text-4xl font-semibold tracking-tight tabular-nums text-zinc-900">{money(priceFor(pl))}</span>
                        <span className="text-sm text-zinc-500">
                          {isMonthly(pl.durationDays) ? t("forPeriod", { count: period }) : tp("card.perDays", { days: pl.durationDays })}
                        </span>
                      </div>
                      {pl.description && <p className="mt-3 text-sm leading-relaxed text-zinc-600">{pl.description}</p>}

                      <p className="mt-6 border-t border-zinc-100 pt-5 text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("included")}</p>
                      <ul className="mt-3 flex-1 space-y-2.5">
                        {pl.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700">
                            <Check className="mt-0.5 size-4 shrink-0 text-sky-600" strokeWidth={2.5} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <PlanChooseButton
                        planId={pl.id}
                        months={termFor(pl)}
                        label={t("choose")}
                        className={cn(pl.highlight ? btnPrimary : btnSecondary, "mt-8 w-full")}
                      />
                    </div>
                  );
                  return pl.highlight ? (
                    <MovingBorderCard key={pl.id} containerClassName="h-full shadow-xl shadow-sky-600/15" className="h-full">
                      {body}
                    </MovingBorderCard>
                  ) : (
                    <div key={pl.id} className="relative z-10 h-full rounded-3xl border border-zinc-200 bg-white shadow-sm">
                      {body}
                    </div>
                  );
                })}
              </HoverEffect>
            </StartBaseProvider>
          )}

          {product && product.includedUsers > 0 && (
            <p className="mt-8 text-center text-sm text-zinc-500">{t("users", { count: product.includedUsers })}</p>
          )}

          {features.length > 0 && columns.length > 0 && (
            <section className="mt-24">
              <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-zinc-900">{t("compare")}</h2>
              <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">{t("feature")}</th>
                      {columns.map((c) => (
                        <th key={c.id} className="px-4 py-4 text-center text-sm font-semibold text-zinc-900">
                          {c.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {features.map((row, i) => (
                      <tr key={i} className="transition-colors hover:bg-zinc-50/70">
                        <td className="px-6 py-3.5 text-sm text-zinc-700">
                          {row.category && <span className="mr-2 text-xs uppercase tracking-wide text-zinc-400">{row.category}</span>}
                          {row.name}
                        </td>
                        {columns.map((c, ci) => (
                          <td key={c.id} className="px-4 py-3.5 text-center">
                            <Cell value={row.values[ci]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { HoverEffect } from "@/components/ui/hover-effect";
import { ProductCard } from "./product-card";

function collectTags(products: Product[]) {
  const seen = new Map<string, string>();
  for (const p of products) {
    for (const tag of p.tags) {
      const key = tag.toLowerCase();
      if (!seen.has(key)) seen.set(key, tag);
    }
  }
  return [...seen].map(([key, label]) => ({ key, label }));
}

export function ProductsGrid({ products }: { products: Product[] }) {
  const t = useTranslations("products");
  const pillId = useId();
  const [active, setActive] = useState("all");
  const tags = useMemo(() => collectTags(products), [products]);

  const visible =
    active === "all"
      ? products
      : products.filter((p) => p.tags.some((tag) => tag.toLowerCase() === active));

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
        {t("list.empty")}
      </p>
    );
  }

  const filters = [{ key: "all", label: t("list.all") }, ...tags];

  return (
    <div>
      {tags.length > 1 && (
        <div role="group" aria-label={t("list.filterLabel")} className="mb-6 flex flex-wrap gap-2">
          {filters.map((f) => {
            const isActive = f.key === active;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(f.key)}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
                  isActive ? "text-white" : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={`${pillId}-pill`}
                    className="absolute inset-0 rounded-full bg-zinc-900"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative">{f.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <HoverEffect key={active} className="-m-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </HoverEffect>
    </div>
  );
}

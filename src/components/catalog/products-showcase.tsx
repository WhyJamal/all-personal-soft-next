"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check, GitCompareArrows, Search, Wrench, X } from "lucide-react";
import type { Product } from "@/lib/api/types";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";
import { GlowCard } from "@/components/profile/glow-card";
import { linearGradient } from "@/components/products/styles";

function collectTags(products: Product[]) {
  const seen = new Map<string, { label: string; count: number }>();
  for (const p of products) {
    for (const tag of new Set(p.tags.map((x) => x.toLowerCase()))) {
      const label = p.tags.find((x) => x.toLowerCase() === tag) ?? tag;
      const cur = seen.get(tag);
      seen.set(tag, { label, count: (cur?.count ?? 0) + 1 });
    }
  }
  return [...seen].map(([key, v]) => ({ key, ...v }));
}

function useBadge() {
  const t = useTranslations("products");
  return (p: Product) => (p.badge ? (t.has(`badges.${p.badge}`) ? t(`badges.${p.badge}`) : p.badge) : null);
}

function Icon({ product, className }: { product: Product; className?: string }) {
  return (
    <span
      className={cn("grid shrink-0 place-items-center overflow-hidden rounded-2xl p-2.5 shadow-lg ring-1 ring-black/5", className)}
      style={{ background: linearGradient(product.gradient) }}
    >
      {product.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.icon} alt="" className="size-full object-contain" />
      ) : (
        <span className="text-lg font-semibold text-zinc-800">{product.title.trim()[0]}</span>
      )}
    </span>
  );
}

function PlanChips({ product, dark }: { product: Product; dark?: boolean }) {
  const format = useFormatter();
  const tc = useTranslations("catalog");
  const plans = [...product.plans].sort((a, b) => a.price - b.price).slice(0, 3);
  if (plans.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={cn("mr-1 text-xs", dark ? "text-zinc-500" : "text-zinc-400")}>{tc("plans")}</span>
      {plans.map((pl) => (
        <span
          key={pl.id}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            dark ? "bg-white/10 text-zinc-200 ring-1 ring-white/10" : "bg-zinc-100 text-zinc-700"
          )}
        >
          {pl.highlight && <span className="size-1.5 rounded-full bg-sky-400" />}
          {pl.name}
          <b className={cn("font-semibold tabular-nums", dark ? "text-white" : "text-zinc-900")}>
            {format.number(pl.price, { notation: "compact", maximumFractionDigits: 0 })}
          </b>
        </span>
      ))}
    </div>
  );
}

function FeaturedCard({ product }: { product: Product }) {
  const t = useTranslations("products");
  const tc = useTranslations("catalog");
  const format = useFormatter();
  const badge = useBadge()(product);
  const clickable = product.isActive || siteConfig.products.linkInactive;
  const bullets = product.features.bullets.slice(0, 3);

  return (
    <GlowCard dark className="rounded-[2rem]">
      {/* colour glows taken from the product's own gradient */}
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full opacity-40 blur-3xl" style={{ background: product.gradient[0] }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 right-0 size-96 rounded-full opacity-30 blur-3xl" style={{ background: product.gradient[2] }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at 70% 30%, #000 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 70% 30%, #000 10%, transparent 70%)",
        }}
      />

      <div className="relative grid gap-10 p-7 sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300 ring-1 ring-sky-400/30">{tc("featured")}</span>
            {badge && <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-200">{badge}</span>}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Icon product={product} className="size-14" />
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {clickable ? (
                <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-sky-400">
                  {product.title}
                </Link>
              ) : (
                product.title
              )}
            </h2>
          </div>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-300">{product.description}</p>

          {bullets.length > 0 && (
            <ul className="mt-6 space-y-2.5">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-zinc-200">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" strokeWidth={2.5} />
                  {b}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-7">
            <PlanChips product={product} dark />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {clickable && (
              <span className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-900 transition-transform group-hover:translate-x-0.5">
                {tc("details")}
                <ArrowRight className="size-4" />
              </span>
            )}
            {product.demoUrl && (
              <a
                href={product.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {tc("demo")}
                <ArrowUpRight className="size-4" />
              </a>
            )}
            {product.startingPrice !== null && (
              <span className="text-sm text-zinc-400">
                {t("card.from")}{" "}
                <b className="text-base font-semibold tabular-nums text-white">
                  {t("card.price", { amount: format.number(product.startingPrice, { maximumFractionDigits: 0 }) })}
                </b>{" "}
                {t("card.perMonth")}
              </span>
            )}
          </div>
        </div>

        {/* visual */}
        <div className="relative hidden lg:block">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-md rotate-2 overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl shadow-black/40 backdrop-blur transition-transform duration-500 group-hover:rotate-0">
            <div className="absolute inset-0 opacity-70" style={{ background: linearGradient(product.gradient) }} />
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt="" loading="lazy" className="relative size-full object-cover" />
            ) : product.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.icon} alt="" className="relative mx-auto size-1/2 h-full object-contain" />
            ) : null}
            <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
          </div>
        </div>
      </div>
    </GlowCard>
  );
}

function ProductRow({ product }: { product: Product }) {
  const t = useTranslations("products");
  const tc = useTranslations("catalog");
  const format = useFormatter();
  const badge = useBadge()(product);
  const clickable = product.isActive || siteConfig.products.linkInactive;

  return (
    <GlowCard className="rounded-3xl transition-shadow duration-300 hover:shadow-xl hover:shadow-sky-900/5">
      <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center md:gap-6">
        <Icon product={product} className="size-14" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
              {clickable ? (
                <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-sky-500">
                  {product.title}
                </Link>
              ) : (
                product.title
              )}
            </h3>
            {!product.isActive ? (
              <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-[11px] font-semibold text-white">{t("card.soon")}</span>
            ) : (
              badge && <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">{badge}</span>
            )}
            {product.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-600">{product.description}</p>
          <div className="mt-3">
            <PlanChips product={product} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-center">
          {product.startingPrice !== null && (
            <div className="md:text-right">
              <div className="text-xs text-zinc-400">{t("card.from")}</div>
              <div className="text-base font-semibold tabular-nums text-zinc-900">
                {t("card.price", { amount: format.number(product.startingPrice, { maximumFractionDigits: 0 }) })}
                <span className="ml-1 text-xs font-normal text-zinc-400">{t("card.perMonth")}</span>
              </div>
              {product.includedUsers > 0 && <div className="mt-0.5 text-xs text-zinc-400">{tc("users", { count: product.includedUsers })}</div>}
            </div>
          )}
          {clickable && (
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-700 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-sky-600 group-hover:text-white">
              <ArrowRight className="size-4" />
            </span>
          )}
        </div>
      </div>
    </GlowCard>
  );
}

export function ProductsShowcase({ products }: { products: Product[] }) {
  const t = useTranslations("products");
  const tc = useTranslations("catalog");
  const pillId = useId();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const tags = useMemo(() => collectTags(products), [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (tag !== "all" && !p.tags.some((x) => x.toLowerCase() === tag)) return false;
      if (!q) return true;
      return [p.title, p.description, ...p.tags].some((s) => s.toLowerCase().includes(q));
    });
  }, [products, query, tag]);

  const featured = filtered.find((p) => p.isActive && p.badge) ?? filtered.find((p) => p.isActive) ?? filtered[0];
  const rest = filtered.filter((p) => p !== featured);
  const filters = [{ key: "all", label: t("list.all"), count: products.length }, ...tags];

  if (products.length === 0) {
    return <p className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">{t("list.empty")}</p>;
  }

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tc("search")}
            aria-label={tc("search")}
            className="h-11 w-full rounded-full border border-zinc-200 bg-white pl-10 pr-10 text-sm text-zinc-900 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label={tc("clear")} className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
              <X className="size-4" />
            </button>
          )}
        </div>

        {tags.length > 1 && (
          <div role="group" aria-label={t("list.filterLabel")} className="flex flex-wrap gap-1.5">
            {filters.map((f) => {
              const on = f.key === tag;
              return (
                <button
                  key={f.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTag(f.key)}
                  className={cn("relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500", on ? "text-white" : "text-zinc-600 hover:text-zinc-900")}
                >
                  {on && <motion.span layoutId={`${pillId}-pill`} className="absolute inset-0 rounded-full bg-zinc-900" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
                  <span className="relative flex items-center gap-1.5">
                    {f.label}
                    <span className={cn("text-xs tabular-nums", on ? "text-white/60" : "text-zinc-400")}>{f.count}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">{tc("noResults")}</p>
          <button type="button" onClick={() => { setQuery(""); setTag("all"); }} className="rounded-full border border-zinc-200 px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
            {tc("clear")}
          </button>
        </div>
      ) : (
        <>
          {featured && (
            <motion.div key={featured.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mt-8">
              <FeaturedCard product={featured} />
            </motion.div>
          )}

          {rest.length > 0 && (
            <section className="mt-12">
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-zinc-900">{tc("all")}</h2>
                <span className="text-xs text-zinc-400">{tc("results", { count: filtered.length })}</span>
              </div>
              <ul className="space-y-4">
                {rest.map((p, i) => (
                  <motion.li key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: Math.min(i, 5) * 0.05 }} className="list-none">
                    <ProductRow product={p} />
                  </motion.li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {/* next steps */}
      <div className="mt-16 grid gap-4 md:grid-cols-2">
        {[
          { href: "/plans", icon: GitCompareArrows, title: tc("compareTitle"), text: tc("compareText"), cta: tc("compareCta") },
          { href: "/service", icon: Wrench, title: tc("helpTitle"), text: tc("helpText"), cta: tc("helpCta") },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-7 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500">
            <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-sky-400/10 blur-2xl transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <span className="grid size-11 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                <c.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">{c.text}</p>
            </div>
            <span className="relative inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600">
              {c.cta}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

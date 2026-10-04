import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import type { Product } from "@/lib/api/types";
import { siteConfig } from "@/config/site.config";
import { isMonthly } from "@/lib/price";
import { Reveal } from "@/components/ui/reveal";
import { GoToBaseButton, StartBaseButton } from "@/components/bases/start-base";
import { ProductHeroVisual } from "./product-hero-visual";
import { btnPrimary, btnSecondary, meshGradient } from "./styles";

export async function ProductHero({ product }: { product: Product }) {
  const t = await getTranslations("products");
  const format = await getFormatter();

  const lowest = product.plans[0];
  const priceText =
    product.startingPrice !== null
      ? t("card.price", { amount: format.number(product.startingPrice, { maximumFractionDigits: 0 }) })
      : null;
  const periodText = lowest
    ? isMonthly(lowest.durationDays)
      ? t("card.perMonth")
      : t("card.perDays", { days: lowest.durationDays })
    : "";

  const badge = product.badge
    ? t.has(`badges.${product.badge}`)
      ? t(`badges.${product.badge}`)
      : product.badge
    : null;

  const demo = product.demoUrl;
  const hasPlans = product.plans.length > 0;
  const canStart = product.isActive && hasPlans;

  return (
    <section className="relative overflow-hidden" style={{ background: meshGradient(product.gradient) }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(#0f172a1f_1px,transparent_1px)] bg-size-[22px_22px] mask-[linear-gradient(to_bottom,black,transparent_85%)]"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-4 pt-10 pb-20 md:px-6 md:pt-14 md:pb-28 lg:grid-cols-[1.05fr_1fr]">
        <Reveal y={20}>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <ArrowLeft className="size-4" />
            {t("detail.back")}
          </Link>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            {!product.isActive ? (
              <span className="rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white">
                {t("card.soon")}
              </span>
            ) : (
              badge && (
                <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-sky-700 shadow-sm">
                  {badge}
                </span>
              )
            )}
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/60 px-2.5 py-1 text-xs font-medium text-zinc-600"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 text-balance md:text-5xl">
            {product.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 md:text-lg">
            {product.hero.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {canStart ? (
              <StartBaseButton className={btnPrimary} />
            ) : demo ? (
              <a href={demo} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                {t("detail.demo")}
                <ExternalLink className="size-4" />
              </a>
            ) : (
              <a href={siteConfig.contactHref} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                {t("detail.contact")}
              </a>
            )}
            <GoToBaseButton className={btnSecondary} />
            {canStart && demo ? (
              <a href={demo} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                {t("detail.demo")}
                <ExternalLink className="size-4" />
              </a>
            ) : hasPlans ? (
              <a href="#plans" className={btnSecondary}>
                {t("detail.choosePlan")}
              </a>
            ) : (
              demo && (
                <a href={siteConfig.contactHref} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                  {t("detail.contact")}
                </a>
              )
            )}
          </div>

          {(priceText || product.includedUsers > 0) && (
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {priceText && (
                <div>
                  <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    {t("detail.startingFrom")}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-zinc-900 tabular-nums">
                    {priceText} <span className="text-sm font-normal text-zinc-500">{periodText}</span>
                  </dd>
                </div>
              )}
              {product.includedUsers > 0 && (
                <div>
                  <dt className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    {t("detail.usersLabel")}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-zinc-900 tabular-nums">
                    {product.includedUsers}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </Reveal>

        <ProductHeroVisual
          image={product.image}
          icon={product.icon}
          gradient={product.gradient}
          priceLabel={priceText ? `${t("card.from")} ${priceText} ${periodText}`.trim() : null}
        />
      </div>
    </section>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { Product } from "@/lib/api/types";
import { siteConfig } from "@/config/site.config";
import { cn } from "@/lib/utils";
import { linearGradient } from "./styles";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("products");
  const format = useFormatter();

  const clickable = product.isActive || siteConfig.products.linkInactive;
  const badge = product.badge
    ? t.has(`badges.${product.badge}`)
      ? t(`badges.${product.badge}`)
      : product.badge
    : null;

  const content = (
    <>
      <div
        className="relative aspect-video overflow-hidden"
        style={{ background: linearGradient(product.gradient) }}
      >
        {product.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt=""
            loading="lazy"
            className={cn(
              "size-full object-cover transition-transform duration-700 group-hover:scale-105",
              !product.isActive && "opacity-60 saturate-50"
            )}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          {!product.isActive ? (
            <span className="rounded-full bg-zinc-900/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
              {t("card.soon")}
            </span>
          ) : (
            badge && (
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-sky-700 backdrop-blur">
                {badge}
              </span>
            )
          )}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-5">
        <div className="-mt-6 mb-3 flex size-12 items-center justify-center rounded-xl border border-zinc-100 bg-white p-2 shadow-md">
          {product.icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.icon} alt="" loading="lazy" className="size-full object-contain" />
          )}
        </div>

        {product.tags.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-1.5">
            {product.tags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{product.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          {product.startingPrice !== null ? (
            <div>
              <div className="text-xs text-zinc-500">{t("card.from")}</div>
              <div className="text-base font-semibold text-zinc-900 tabular-nums">
                {t("card.price", {
                  amount: format.number(product.startingPrice, { maximumFractionDigits: 0 }),
                })}{" "}
                <span className="text-xs font-normal text-zinc-500">{t("card.perMonth")}</span>
              </div>
            </div>
          ) : (
            <span />
          )}

          {clickable && (
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-sky-600 group-hover:text-white"
            >
              <ArrowRight className="size-4" />
            </span>
          )}
        </div>
      </div>
    </>
  );

  const shell =
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow duration-300";

  if (!clickable) {
    return (
      <div aria-disabled className={cn(shell, "cursor-default")}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        shell,
        "hover:shadow-xl hover:shadow-sky-900/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      )}
    >
      {content}
    </Link>
  );
}

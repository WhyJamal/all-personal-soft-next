import { ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Product } from "@/lib/api/types";
import { siteConfig } from "@/config/site.config";
import { Reveal } from "@/components/ui/reveal";
import { btnPrimary, btnSecondary, linearGradient } from "./styles";
import Link from "next/link";

export async function ProductCta({ product }: { product: Product }) {
  const t = await getTranslations("products");

  return (
    <section className="bg-zinc-50">
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 md:px-6 md:pb-28">
        <Reveal>
          <div
            className="rounded-3xl border border-zinc-200 px-6 py-14 text-center md:px-12"
            style={{ background: linearGradient(product.gradient) }}
          >
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-zinc-900 text-balance md:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-600">{t("cta.text")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {product.demoUrl && (
                <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                  {t("detail.demo")}
                  <ExternalLink className="size-4" />
                </a>
              )}
              <Link href={"/contact"} rel="noopener noreferrer" className={btnSecondary}>
                {t("detail.contact")}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

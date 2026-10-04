import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProducts } from "@/lib/api/products";
import { ProductsShowcase } from "@/components/catalog/products-showcase";
import { eyebrow } from "@/components/products/styles";
import { Spotlight } from "@/components/ui/spotlight";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("products");
  return { title: t("list.metaTitle"), description: t("list.subtitle") };
}

export default async function ProductsPage() {
  const [t, products] = await Promise.all([getTranslations("products"), getProducts()]);

  return (
    <>
      <section className="relative overflow-hidden bg-linear-to-b from-sky-50 via-white to-zinc-50">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#38bdf8" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-16 pb-10 md:px-6 md:pt-10 md:pb-14">
          <p className={eyebrow}>{t("list.eyebrow")}</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 text-balance md:text-5xl">
            {t("list.title")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 md:text-lg">
            {t("list.subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-zinc-50">
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-2 md:px-6">
          <ProductsShowcase products={products} />
        </div>
      </section>
    </>
  );
}

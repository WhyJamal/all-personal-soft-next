import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/api/products";
import { siteConfig } from "@/config/site.config";
import { PlansSection } from "@/components/products/plans-section";
import { ProductCta } from "@/components/products/product-cta";
import { ProductFeatures } from "@/components/products/product-features";
import { ProductHero } from "@/components/products/product-hero";
import { ProductModules } from "@/components/products/product-modules";
import { StartBaseProvider } from "@/components/bases/start-base";
import { ProductReviews } from "@/components/reviews/product-reviews";

type Props = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  try {
    const product = await getProductBySlug(name);
    if (!product) return {};
    return {
      title: `${product.title} — ${siteConfig.name}`,
      description: product.hero.description || product.description,
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params }: Props) {
  const { name } = await params;
  const product = await getProductBySlug(name);
  if (!product) notFound();

  const startProduct = {
    id: product.id,
    slug: product.slug,
    title: product.title,
    isActive: product.isActive,
    includedUsers: product.includedUsers,
    extraUserPrice: product.extraUserPrice,
    plans: product.plans.map((p) => ({ id: p.id, name: p.name, price: p.price, durationDays: p.durationDays })),
  };

  return (
    <StartBaseProvider product={startProduct}>
      <ProductHero product={product} />
      <ProductFeatures product={product} />
      <ProductModules product={product} />
      <PlansSection product={product} />
      <ProductReviews productId={product.id} />
      <ProductCta product={product} />
    </StartBaseProvider>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProducts } from "@/lib/api/products";
import { getPlanFeatures } from "@/lib/plans/server";
import { PlansView } from "@/components/plans/plans-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("plans");
  return { title: t("title"), description: t("subtitle") };
}

export default async function PlansPage() {
  const [products, features] = await Promise.all([getProducts(), getPlanFeatures()]);

  const withPlans = products
    .filter((p) => p.isActive && p.plans.length > 0)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      icon: p.icon,
      isActive: p.isActive,
      includedUsers: p.includedUsers,
      extraUserPrice: p.extraUserPrice,
      plans: p.plans.map((pl) => ({
        id: pl.id,
        name: pl.name,
        description: pl.description,
        price: pl.price,
        durationDays: pl.durationDays,
        features: pl.features,
        highlight: pl.highlight,
      })),
    }));

  return <PlansView products={withPlans} features={features} />;
}

import { getTranslations } from "next-intl/server";
import { features } from "@/config/features.config";
import { FeatureCard } from "@/components/feature-card";

export async function FeaturesSection() {
  const t = await getTranslations("landing");

  return (
    <section id="features" className="w-full scroll-mt-14 bg-zinc-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-20">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
            {t("features.heading")}
          </h2>
          <p className="mt-4 text-base text-zinc-500 md:text-lg">{t("features.subheading")}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <FeatureCard
              key={f.title}
              title={t(f.title)}
              desc={t(f.desc)}
              icon={f.icon}
              image={f.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

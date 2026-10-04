import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Product } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { LiteYoutube } from "./lite-youtube";
import { eyebrow, sectionTitle } from "./styles";

export async function ProductFeatures({ product }: { product: Product }) {
  const t = await getTranslations("products");
  const { features } = product;
  if (features.bullets.length === 0 && !features.videoId) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <div className={cn("grid items-center gap-12 lg:gap-16", features.videoId && "lg:grid-cols-2")}>
          <div>
            <p className={eyebrow}>{t("features.eyebrow")}</p>
            {features.title && <h2 className={sectionTitle}>{features.title}</h2>}

            <ul className="mt-8 space-y-4">
              {features.bullets.map((bullet, i) => (
                <li key={bullet}>
                  <Reveal delay={i * 0.06} y={10} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-base leading-relaxed text-zinc-700">{bullet}</span>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          {features.videoId && (
            <Reveal>
              <LiteYoutube
                id={features.videoId}
                title={features.title || product.title}
                label={t("features.playVideo", { title: features.title || product.title })}
              />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

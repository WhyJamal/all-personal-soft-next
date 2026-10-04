import { Check } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import type { Plan, Product } from "@/lib/api/types";
import { isMonthly } from "@/lib/price";
import { cn } from "@/lib/utils";
import { PlanChooseButton } from "@/components/bases/start-base";
import { MovingBorderCard } from "@/components/ui/moving-border";
import { Reveal } from "@/components/ui/reveal";
import { btnPrimary, btnSecondary, eyebrow, sectionTitle } from "./styles";

type PlanBodyProps = {
  plan: Plan;
  price: string;
  period: string;
  recommended: string | null;
  cta: string;
};

function PlanBody({ plan, price, period, recommended, cta }: PlanBodyProps) {
  return (
    <div className="flex h-full flex-col p-7">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-wide text-zinc-900 uppercase">{plan.name}</h3>
        {recommended && (
          <span className="rounded-full bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white">
            {recommended}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-baseline gap-1.5">
        <span className="text-4xl font-semibold tracking-tight text-zinc-900 tabular-nums">{price}</span>
        <span className="text-sm text-zinc-500">{period}</span>
      </div>
      {plan.description && <p className="mt-3 text-sm leading-relaxed text-zinc-600">{plan.description}</p>}

      <ul className="mt-6 flex-1 space-y-3 border-t border-zinc-100 pt-6">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-zinc-700">
            <Check className="mt-0.5 size-4 shrink-0 text-sky-600" strokeWidth={2.5} />
            {feature}
          </li>
        ))}
      </ul>

      <PlanChooseButton
        planId={plan.id}
        label={cta}
        className={cn(recommended ? btnPrimary : btnSecondary, "mt-8 w-full")}
      />
    </div>
  );
}

export async function PlansSection({ product }: { product: Product }) {
  const t = await getTranslations("products");
  const format = await getFormatter();
  const { plans } = product;

  const money = (n: number) => t("card.price", { amount: format.number(n, { maximumFractionDigits: 0 }) });

  return (
    <section id="plans" className="scroll-mt-14 bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <div className="max-w-xl">
          <p className={eyebrow}>{t("plans.eyebrow")}</p>
          <h2 className={sectionTitle}>{t("plans.title")}</h2>
          <p className="mt-4 text-base text-zinc-500 md:text-lg">{t("plans.subtitle")}</p>
        </div>

        {plans.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
            {t("plans.empty")}
          </p>
        ) : (
          <>
            <div
              className={cn(
                "mt-12 grid items-stretch gap-6",
                plans.length === 1 && "mx-auto max-w-md",
                plans.length === 2 && "mx-auto max-w-3xl md:grid-cols-2",
                plans.length >= 3 && "md:grid-cols-2 lg:grid-cols-3"
              )}
            >
              {plans.map((plan, i) => {
                const body = (
                  <PlanBody
                    plan={plan}
                    price={money(plan.price)}
                    period={isMonthly(plan.durationDays) ? t("card.perMonth") : t("card.perDays", { days: plan.durationDays })}
                    recommended={plan.highlight ? t("plans.recommended") : null}
                    cta={t("plans.choose")}
                  />
                );
                return (
                  <Reveal key={plan.id} delay={i * 0.08} className="h-full">
                    {plan.highlight ? (
                      <MovingBorderCard containerClassName="h-full lg:-translate-y-2 shadow-xl shadow-sky-600/15" className="h-full">
                        {body}
                      </MovingBorderCard>
                    ) : (
                      <div className="h-full rounded-3xl border border-zinc-200 bg-white shadow-sm">{body}</div>
                    )}
                  </Reveal>
                );
              })}
            </div>

            {product.includedUsers > 0 && (
              <p className="mt-8 text-center text-sm text-zinc-500">
                {t("plans.usersIncluded", { count: product.includedUsers })}
                {product.extraUserPrice > 0 && (
                  <>
                    {" · "}
                    {t("plans.extraUser", { price: money(product.extraUserPrice) })}
                  </>
                )}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

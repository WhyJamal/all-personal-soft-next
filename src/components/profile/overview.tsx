"use client";

import { useState } from "react";
import { ArrowRight, Building2, Check, Copy, Hourglass, Layers, Plus, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ProfileData } from "@/lib/profile/types";
import { GlowCard } from "./glow-card";
import { OrgCta } from "./org-cta";
import { TopUpModal } from "@/components/bases/topup-modal";
import { ProductCard } from "./product-card";
import { daysLeft, formatDate, formatMoney, statusOf } from "./format";

function Label({ icon: Icon, children, dark }: { icon: typeof Wallet; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 text-xs font-medium", dark ? "text-zinc-400" : "text-zinc-500")}>
      <Icon className="size-3.5" />
      {children}
    </div>
  );
}

function CopyCode({ code }: { code: string }) {
  const t = useTranslations("profile.stats");
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {}
      }}
      className="group/copy flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-left transition-colors hover:border-sky-400 hover:bg-sky-50/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
    >
      <span className="font-mono text-lg font-semibold tracking-[0.18em] text-zinc-900">{code}</span>
      <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 group-hover/copy:text-sky-600">
        {done ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
        {done ? t("copied") : t("copy")}
      </span>
    </button>
  );
}

export function Overview({ me, now, onViewAll }: { me: ProfileData; now: number; onViewAll: () => void }) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const [topUp, setTopUp] = useState(false);

  const live = me.products.filter((p) => statusOf(p.end, now) !== "expired");
  const soonest = [...live].sort((a, b) => +new Date(a.end) - +new Date(b.end));
  const next = soonest[0];

  return (
    <div className="space-y-10">
      {!me.org && <OrgCta />}
      <div className="grid gap-4 md:grid-cols-6">
        {/* Balance */}
        <GlowCard dark className="min-h-60 p-7 md:col-span-3 md:row-span-2">
          <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-sky-500/25 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <Label icon={Wallet} dark>
              {t("stats.balance")}
            </Label>
            <div>
              <div className="text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">
                {formatMoney(me.walletBalance, locale)}
              </div>
              <div className="mt-2 text-sm text-zinc-400">{t("stats.currency")}</div>
              {me.org && (
                <button
                  type="button"
                  onClick={() => setTopUp(true)}
                  className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-xs font-semibold text-zinc-900 transition-colors hover:bg-sky-100"
                >
                  <Plus className="size-3.5" />
                  {t("stats.topUp")}
                </button>
              )}
            </div>
          </div>
        </GlowCard>

        {/* Active products */}
        <GlowCard className="p-6 md:col-span-3">
          <Label icon={Layers}>{t("stats.active")}</Label>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight tabular-nums">{live.length}</span>
            <span className="text-sm text-zinc-400">{t("stats.ofTotal", { total: me.products.length })}</span>
          </div>
        </GlowCard>

        {/* Next expiry */}
        <GlowCard className="p-6 md:col-span-3">
          <Label icon={Hourglass}>{t("stats.next")}</Label>
          {next ? (
            <div className="mt-4">
              <div className="text-2xl font-semibold tracking-tight">{formatDate(next.end, locale)}</div>
              <div
                className={cn(
                  "mt-1 text-sm",
                  statusOf(next.end, now) === "expiring" ? "text-amber-600" : "text-zinc-400"
                )}
              >
                {t("days", { count: daysLeft(next.end, now) })} · {next.title}
              </div>
            </div>
          ) : (
            <div className="mt-4 text-2xl font-semibold tracking-tight text-zinc-300">{t("stats.none")}</div>
          )}
        </GlowCard>

        {/* Promo */}
        {me.promoCode && (
          <GlowCard className="p-6 md:col-span-3">
            <Label icon={Copy}>{t("stats.promo")}</Label>
            <div className="mt-4">
              <CopyCode code={me.promoCode} />
            </div>
          </GlowCard>
        )}

        {/* Organization */}
        {me.org && (
          <GlowCard className={cn("p-6", me.promoCode ? "md:col-span-3" : "md:col-span-6")}>
            <Label icon={Building2}>{t("stats.org")}</Label>
            <div className="mt-4 text-lg font-semibold tracking-tight">{me.org.name}</div>
            <dl className="mt-2 space-y-1 text-sm text-zinc-500">
              <div className="flex gap-2">
                <dt className="text-zinc-400">{t("stats.inn")}</dt>
                <dd className="font-mono text-zinc-700">{me.org.inn}</dd>
              </div>
              {me.org.address && (
                <div className="flex gap-2">
                  <dt className="text-zinc-400">{t("stats.address")}</dt>
                  <dd className="text-zinc-700">{me.org.address}</dd>
                </div>
              )}
            </dl>
          </GlowCard>
        )}
      </div>

      {soonest.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">{t("stats.soon")}</h2>
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1 text-sm font-medium text-sky-600 transition-colors hover:text-sky-500"
            >
              {t("stats.viewAll")}
              <ArrowRight className="size-3.5" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {soonest.slice(0, 3).map((p) => (
              <ProductCard key={p.id} product={p} now={now} />
            ))}
          </div>
        </section>
      )}
      {me.org && <TopUpModal open={topUp} onClose={() => setTopUp(false)} orgInn={me.org.inn} />}
    </div>
  );
}

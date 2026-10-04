"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Building2, Mail, Pencil, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileData } from "@/lib/profile/types";
import { Avatar } from "@/components/avatar";
import { MovingBorderCard } from "@/components/ui/moving-border";
import { Backdrop } from "./backdrop";
import { Overview } from "./overview";
import { ProductsPanel } from "./products-panel";
import { SettingsPanel } from "./settings-panel";
import { useViewMode } from "./use-view-mode";
import { ViewDock } from "./view-dock";

const TABS = ["overview", "products", "settings"] as const;
type Tab = (typeof TABS)[number];

export function ProfileView({ me, now }: { me: ProfileData; now: number }) {
  const t = useTranslations("profile");
  const [tab, setTab] = useState<Tab>("overview");
  const [view, setView] = useViewMode();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-5 sm:px-6">
      {/* Cover + identity */}
      <section>
        <div className="relative h-44 sm:h-56">
          <Backdrop />
        </div>

        <div className="relative -mt-14 flex flex-col gap-4 px-3 sm:-mt-16 sm:flex-row sm:items-end sm:gap-6 sm:px-8">
          <div className="relative size-28 shrink-0 sm:size-32">
            <motion.span
              aria-hidden
              className="absolute -inset-1 rounded-full bg-[conic-gradient(from_0deg,#0ea5e9,#6366f1,#22d3ee,#0ea5e9)]"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <span className="absolute inset-0.5 rounded-full bg-white" />
            <Avatar name={me.username} src={me.avatarUrl} className="absolute inset-1.5 text-4xl" />
          </div>

          <div className="min-w-0 flex-1 sm:pb-2">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">{me.username}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
              <span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" />{me.email}</span>
              {me.phone && <span className="inline-flex items-center gap-1.5"><Phone className="size-3.5" />{me.phone}</span>}
              {me.org && <span className="inline-flex items-center gap-1.5"><Building2 className="size-3.5" />{me.org.name}</span>}
            </div>
          </div>

          <button type="button" onClick={() => setTab("settings")} className="self-start rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 sm:mb-2 sm:self-auto">
            <MovingBorderCard radius={20} containerClassName="h-10">
              <span className="flex h-full items-center gap-2 px-4 text-sm font-medium text-zinc-900">
                <Pencil className="size-3.5" />
                {t("hero.edit")}
              </span>
            </MovingBorderCard>
          </button>
        </div>

        <p className={cn("mt-5 max-w-2xl px-3 text-sm leading-relaxed sm:px-8", me.bio ? "text-zinc-600" : "text-zinc-400")}>
          {me.bio || t("hero.noBio")}
        </p>
      </section>

      {/* Tabs */}
      <div role="tablist" className="mt-9 inline-flex rounded-full bg-zinc-100 p-1">
        {TABS.map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className="relative rounded-full px-4 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-sky-500"
          >
            {tab === k && (
              <motion.span
                layoutId="profile-tab"
                className="absolute inset-0 rounded-full bg-white shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className={cn("relative flex items-center gap-1.5", tab === k ? "text-zinc-900" : "text-zinc-500")}>
              {t(`tabs.${k}`)}
              {k === "products" && me.products.length > 0 && (
                <span className="rounded-full bg-zinc-900/5 px-1.5 text-[11px] tabular-nums">{me.products.length}</span>
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "overview" && <Overview me={me} now={now} onViewAll={() => setTab("products")} />}
            {tab === "products" && <ProductsPanel products={me.products} now={now} hasOrg={!!me.org} view={view} balance={me.walletBalance} orgInn={me.org?.inn ?? ""} />}
            {tab === "settings" && <SettingsPanel me={me} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <ViewDock show={tab === "products" && !!me.org && me.products.length > 0} view={view} onChange={setView} />
    </div>
  );
}

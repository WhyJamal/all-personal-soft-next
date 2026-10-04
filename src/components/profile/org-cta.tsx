"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, Plus } from "lucide-react";
import { CreateOrgModal } from "./create-org-modal";
import { GlowCard } from "./glow-card";

/** Shown while the user has no organization yet. */
export function OrgCta() {
  const t = useTranslations("manage.org");
  const [open, setOpen] = useState(false);

  return (
    <>
      <GlowCard className="border-sky-200 bg-gradient-to-br from-sky-50 via-white to-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/30">
              <Building2 className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">{t("title")}</h2>
              <p className="mt-1 text-sm text-zinc-500">{t("subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(2_132_199/0.6)] transition-all hover:bg-sky-500 active:translate-y-px"
          >
            <Plus className="size-4" />
            {t("cta")}
          </button>
        </div>
      </GlowCard>
      <CreateOrgModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

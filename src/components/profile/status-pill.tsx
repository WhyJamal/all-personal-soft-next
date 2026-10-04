"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Status } from "./format";

const PILL: Record<Status, string> = {
  active: "bg-emerald-50 text-emerald-700",
  expiring: "bg-amber-50 text-amber-700",
  expired: "bg-zinc-100 text-zinc-500",
};
const DOT: Record<Status, string> = { active: "bg-emerald-500", expiring: "bg-amber-500", expired: "bg-zinc-400" };

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const t = useTranslations("profile.products.status");
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium", PILL[status], className)}>
      <span className={cn("size-1.5 rounded-full", DOT[status])} />
      {t(status)}
    </span>
  );
}

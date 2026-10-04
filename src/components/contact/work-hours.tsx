"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Clock3 } from "lucide-react";
import { contactConfig } from "@/config/contact.config";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Re-renders once a minute; the server snapshot is 0 so SSR and hydration agree. */
function subscribe(cb: () => void) {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
}
const minuteNow = () => Math.floor(Date.now() / 60_000);

function tashkentParts(ts: number) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: contactConfig.timezone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(ts);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return { day: DAYS.indexOf(get("weekday")), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

export function WorkHours() {
  const t = useTranslations("contact.hours");
  const stamp = useSyncExternalStore(subscribe, minuteNow, () => 0);

  const now = stamp ? tashkentParts(stamp * 60_000) : null;
  const todayRow = now ? contactConfig.hours.find((h) => (h.days as number[]).includes(now.day)) : undefined;
  const isOpen = !!now && !!todayRow && now.minutes >= toMin(todayRow.from) && now.minutes < toMin(todayRow.to);
  const sundayToday = now?.day === 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-zinc-950 p-6 text-white">
      <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-sky-500/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Clock3 className="size-4 text-sky-400" />
          {t("title")}
        </h3>
        {now && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              isOpen ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-zinc-300"
            )}
          >
            <span className="relative flex size-2">
              {isOpen && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
              <span className={cn("relative inline-flex size-2 rounded-full", isOpen ? "bg-emerald-400" : "bg-zinc-500")} />
            </span>
            {isOpen ? t("open") : t("closed")}
          </span>
        )}
      </div>

      <dl className="relative mt-5 space-y-1 text-sm">
        {contactConfig.hours.map((h) => {
          const today = !!todayRow && todayRow.id === h.id;
          return (
            <div
              key={h.id}
              className={cn("flex items-center justify-between rounded-xl px-3 py-2.5", today ? "bg-white/10" : "text-zinc-400")}
            >
              <dt className={today ? "font-medium text-white" : undefined}>{t(h.id)}</dt>
              <dd className="tabular-nums">
                {h.from} – {h.to}
              </dd>
            </div>
          );
        })}
        <div className={cn("flex items-center justify-between rounded-xl px-3 py-2.5", sundayToday ? "bg-white/10" : "text-zinc-400")}>
          <dt className={sundayToday ? "font-medium text-white" : undefined}>{t("sunday")}</dt>
          <dd>{t("dayOff")}</dd>
        </div>
      </dl>

      <p className="relative mt-4 px-3 text-xs text-zinc-500">{t("timezone")}</p>
    </div>
  );
}

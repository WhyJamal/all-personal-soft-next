"use client";

import { useEffect, useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import {
  CalendarClock,
  Check,
  MessagesSquare,
  Minus,
  PackageOpen,
  Phone,
  Plus,
  Send,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { serviceContacts, services, type ServiceConfig } from "@/config/service.config";

const ICONS: Record<string, LucideIcon> = {
  "service-1": Wrench,
  "service-2": CalendarClock,
  "service-3": PackageOpen,
  "service-4": MessagesSquare,
  "service-5": Sparkles,
};
const PRICE_LABEL = { hourly: "hourly", daily: "daily", "one-time": "oneTime" } as const;
const PRESETS = { hourly: [1, 2, 4, 8], daily: [1, 2, 3, 5, 7] } as const;

function AnimatedNumber({ value }: { value: number }) {
  const format = useFormatter();
  const mv = useMotionValue(value);
  const text = useTransform(mv, (n) => format.number(Math.round(n), { maximumFractionDigits: 0 }));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.5, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);
  return <motion.span>{text}</motion.span>;
}

function ServiceOption({ s, active, onSelect }: { s: ServiceConfig; active: boolean; onSelect: () => void }) {
  const t = useTranslations("service");
  const format = useFormatter();
  const Icon = ICONS[s.id] ?? Sparkles;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onSelect}
      className="group relative w-full rounded-2xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
    >
      {active && (
        <motion.span
          layoutId="service-active"
          className="absolute inset-0 rounded-2xl border-2 border-sky-500 bg-sky-50/70 shadow-lg shadow-sky-500/10"
          transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
        />
      )}
      <span
        className={cn(
          "relative flex items-center gap-4 rounded-2xl border p-4 transition-colors sm:p-5",
          active ? "border-transparent" : "border-zinc-200 bg-white group-hover:border-zinc-300 group-hover:bg-zinc-50/60"
        )}
      >
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl transition-all duration-300",
            active ? "bg-linear-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30" : "bg-zinc-100 text-zinc-500 group-hover:bg-sky-50 group-hover:text-sky-600"
          )}
        >
          <Icon className="size-5" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-zinc-900">{t(`items.${s.id}.title`)}</span>
          <span className="mt-0.5 line-clamp-2 block text-sm leading-5 text-zinc-500">{t(`items.${s.id}.description`)}</span>
        </span>

        <span className="shrink-0 text-right">
          <span className="block text-[15px] font-semibold tabular-nums text-zinc-900">{format.number(s.price, { maximumFractionDigits: 0 })}</span>
          <span className="block text-xs text-zinc-400">
            {t("currency")} · {t(PRICE_LABEL[s.priceType])}
          </span>
        </span>
      </span>
    </button>
  );
}

export function ServiceView() {
  const t = useTranslations("service");
  const format = useFormatter();
  const [activeId, setActiveId] = useState(services[0].id);
  const [qty, setQty] = useState(1);
  const panel = useRef<HTMLDivElement>(null);

  const s = services.find((x) => x.id === activeId) ?? services[0];
  const variable = s.priceType !== "one-time";
  const total = variable ? s.price * qty : s.price;
  const Icon = ICONS[s.id] ?? Sparkles;
  const features = t.raw(`items.${s.id}.features`) as string[];

  const num = (n: number) => format.number(n, { maximumFractionDigits: 0 });
  const qtyText = s.priceType === "hourly" ? t("msgHours", { count: qty }) : s.priceType === "daily" ? t("msgDays", { count: qty }) : "";
  const message = t("message", { service: t(`items.${s.id}.title`), qty: qtyText, total: num(total), currency: t("currency") });
  const telegram = s.telegram ?? serviceContacts.telegram;
  const phones = s.phone ? [s.phone] : serviceContacts.phones;

  function select(id: string) {
    setActiveId(id);
    setQty(1);
    // on phones the summary sits below the list: bring it into view
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  const steps = [t("steps.one"), t("steps.two"), t("steps.three")];

  return (
    <div className="relative">
      {/* soft background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-120"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(228 228 231 / .7) 1px, transparent 1px), linear-gradient(to bottom, rgb(228 228 231 / .7) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 60% 70% at 50% 0%, #000 20%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 70% at 50% 0%, #000 20%, transparent 100%)",
        }}
      />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-72 w-140 -translate-x-1/2 rounded-full bg-sky-400/20 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-24 pt-12 md:px-6 md:pt-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 text-balance md:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-base text-zinc-500 md:text-lg">{t("subtitle")}</p>
        </div>

        {/* how it works */}
        <ol className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-3 text-sm font-medium text-zinc-600">
              <span className="grid size-7 place-items-center rounded-full bg-zinc-900 text-xs font-semibold text-white">{i + 1}</span>
              {label}
              {i < steps.length - 1 && <span aria-hidden className="ml-5 hidden h-px w-10 bg-zinc-300 sm:block" />}
            </li>
          ))}
        </ol>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_460px]">
          {/* pick */}
          <div role="radiogroup" aria-label={t("pick")} className="space-y-3">
            {services.map((svc) => (
              <ServiceOption key={svc.id} s={svc} active={svc.id === activeId} onSelect={() => select(svc.id)} />
            ))}
          </div>

          {/* summary */}
          <div ref={panel} className="scroll-mt-20 lg:sticky lg:top-20">
            <div className="relative overflow-hidden rounded-3xl bg-zinc-950 p-6 text-white shadow-2xl shadow-zinc-900/20 sm:p-7">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-sky-500/30 blur-3xl" />
              <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-indigo-500/25 blur-3xl" />

              <div className="relative">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                        <Icon className="size-5 text-sky-300" />
                      </span>
                      <h2 className="text-lg font-semibold tracking-tight">{t(`items.${s.id}.title`)}</h2>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">{t(`items.${s.id}.description`)}</p>

                    <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">{t("included")}</p>
                    <ul className="mt-3 space-y-2.5">
                      {features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-200">
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" strokeWidth={2.5} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>

                <div className="my-6 h-px bg-white/10" />

                {/* amount */}
                {variable ? (
                  <div>
                    <p className="text-xs font-medium text-zinc-400">{s.priceType === "hourly" ? t("hoursLabel") : t("daysLabel")}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        aria-label="−"
                        className="grid size-10 place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/20 active:scale-95"
                      >
                        <Minus className="size-4" />
                      </button>
                      <input
                        inputMode="numeric"
                        value={qty}
                        onChange={(e) => setQty(Math.min(999, Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1)))}
                        className="h-10 w-16 rounded-xl bg-white/10 text-center text-base font-semibold tabular-nums outline-none ring-1 ring-transparent focus:ring-sky-400"
                      />
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.min(999, q + 1))}
                        aria-label="+"
                        className="grid size-10 place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/20 active:scale-95"
                      >
                        <Plus className="size-4" />
                      </button>
                      <span className="text-sm text-zinc-400">{s.priceType === "hourly" ? t("unitHour") : t("unitDay")}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {PRESETS[s.priceType as "hourly" | "daily"].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setQty(p)}
                          className={cn(
                            "rounded-full px-3.5 py-1 text-xs font-medium transition-colors",
                            qty === p ? "bg-sky-500 text-white" : "bg-white/10 text-zinc-300 hover:bg-white/15"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-zinc-400">{t("fixed")}</p>
                )}

                {/* total */}
                <div className="mt-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-xs font-medium text-zinc-400">{t("total")}</p>
                  <p className="mt-1 flex items-baseline gap-2 text-4xl font-semibold tracking-tight tabular-nums">
                    <AnimatedNumber value={total} />
                    <span className="text-base font-normal text-zinc-400">{t("currency")}</span>
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">{t("totalNote")}</p>
                </div>

                {/* contact */}
                <div className="mt-5 space-y-2.5">
                  <a
                    href={`https://t.me/${telegram}?text=${encodeURIComponent(message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgb(14_165_233/0.8)] transition-all hover:bg-sky-400 active:translate-y-px"
                  >
                    <Send className="size-4" />
                    {t("order")}
                  </a>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {phones.slice(0, 2).map((phone) => (
                      <a
                        key={phone}
                        href={`tel:${phone.replace(/\s/g, "")}`}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10"
                      >
                        <Phone className="size-4" />
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

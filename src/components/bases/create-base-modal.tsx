"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, Check, CheckCircle2, Copy, ExternalLink, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { BffError, bff, errorMessage } from "@/lib/api/bff";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { AuthInput } from "@/components/auth/auth-input";
import { SubmitButton } from "@/components/auth/submit-button";
import { INTL_LOCALE } from "@/components/profile/format";
import { isMonthly } from "@/lib/price";
import { PeriodPicker } from "./period-picker";

export type StartProduct = {
  id: number;
  slug: string;
  title: string;
  isActive: boolean;
  includedUsers: number;
  extraUserPrice: number;
  plans: { id: number; name: string; price: number; durationDays: number }[];
};

export function CreateBaseModal({
  open,
  onClose,
  product,
  org,
  balance,
  initialPlanId,
  initialMonths = 1,
  onTopUp,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  product: StartProduct;
  org: { id: number };
  balance: number;
  initialPlanId?: number;
  initialMonths?: number;
  onTopUp: () => void;
  onCreated: () => void;
}) {
  const t = useTranslations("manage.create");
  const locale = useLocale();
  const { toast } = useToast();
  const fmt = (n: number) => new Intl.NumberFormat(INTL_LOCALE[locale] ?? locale, { maximumFractionDigits: 0 }).format(n);

  const [title, setTitle] = useState("");
  const [planId, setPlanId] = useState<number | null>(initialPlanId ?? product.plans.find((p) => p.id)?.id ?? null);
  const [users, setUsers] = useState(Math.max(1, product.includedUsers));
  const [months, setMonths] = useState(initialMonths);
  // captured once so the "valid until" date does not change while the modal is open
  const [openedAt] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [insufficient, setInsufficient] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const plan = product.plans.find((p) => p.id === planId);
  const extra = Math.max(0, users - product.includedUsers);
  // A plan that is not a 30-day plan is bought as it is, one period at a time.
  const term = plan && isMonthly(plan.durationDays) ? months : 1;
  const total = plan ? (plan.price + extra * product.extraUserPrice) * term : null;
  const until = plan ? new Intl.DateTimeFormat(INTL_LOCALE[locale] ?? locale, { dateStyle: "long" }).format(openedAt + plan.durationDays * term * 86_400_000) : null;
  const enough = total === null || balance >= total;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!plan || loading) return;
    setLoading(true);
    setError("");
    setInsufficient(false);
    try {
      const res = await bff.post<{ product_url?: string; subscription_end_date?: string | null }>("organizations/product/add/", {
        organization: org.id,
        product: product.id,
        subscription: "",
        plan: plan.id,
        title: title.trim(),
        user_count: users,
        months: term,
      });
      toast(t("doneTitle"), "success");
      // An older backend ignores `months`; say so instead of letting the customer think the term was applied.
      const appliedDays = res.subscription_end_date ? (Date.parse(res.subscription_end_date) - openedAt) / 86_400_000 : null;
      if (term > 1 && appliedDays !== null && appliedDays < plan.durationDays * term * 0.8) {
        toast(t("termNotApplied", { days: Math.max(1, Math.round(appliedDays)) }), "info");
      }
      setUrl(res.product_url ?? "");
      onCreated();
    } catch (err) {
      const data = err instanceof BffError ? (err.data as { error?: string } | null) : null;
      if ((err instanceof BffError && err.status === 402) || data?.error === "insufficient_balance") {
        setInsufficient(true);
        setError(t("insufficient"));
      } else {
        setError(errorMessage(err, t("insufficient")));
      }
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast(t("copied"), "success");
    } catch {}
  }

  return (
    <Modal open={open} onClose={onClose} title={url !== null ? t("doneTitle") : `${t("title")} · ${product.title}`}>
      {url !== null ? (
        <div className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-500">
            <CheckCircle2 className="size-7" />
          </span>
          {url && (
            <div className="mt-5 text-left">
              <p className="text-xs font-medium text-zinc-500">{t("url")}</p>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 py-1.5 pl-3.5 pr-1.5">
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-700">{url}</span>
                <button
                  type="button"
                  onClick={copy}
                  aria-label={t("copy")}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900"
                >
                  <Copy className="size-4" />
                </button>
              </div>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
              >
                <ExternalLink className="size-4" />
                {t("open")}
              </a>
            )}
            <Link
              href="/profile"
              className="flex h-11 flex-1 items-center justify-center rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              {t("toProfile")}
            </Link>
          </div>
        </div>
      ) : product.plans.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">{t("noPlans")}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AuthInput name="title" label={t("name")} placeholder={t("namePh")} value={title} onChange={(e) => setTitle(e.target.value)} />

          <div>
            <p className="mb-1.5 text-sm font-medium text-zinc-700">{t("plan")}</p>
            <div className="space-y-2">
              {product.plans.map((p) => {
                const on = p.id === planId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setPlanId(p.id); setError(""); setInsufficient(false); }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                      on ? "border-sky-500 bg-sky-50/70 ring-4 ring-sky-500/10" : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={cn("grid size-5 place-items-center rounded-full border", on ? "border-sky-600 bg-sky-600 text-white" : "border-zinc-300")}>
                        {on && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <span className="text-sm font-semibold text-zinc-900">{p.name}</span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-zinc-900">
                      {fmt(p.price)} <span className="text-xs font-normal text-zinc-400">{t("uzs")}</span>
                      <span className="block text-right text-[11px] font-normal text-zinc-400">
                        {p.durationDays === 30 ? t("perMonth") : t("perDays", { days: p.durationDays })}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {plan && isMonthly(plan.durationDays) && <PeriodPicker value={months} onChange={setMonths} />}

          <div>
            <p className="mb-1.5 text-sm font-medium text-zinc-700">{t("users")}</p>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setUsers((u) => Math.max(1, u - 1))} className="grid size-10 place-items-center rounded-xl border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50">
                <Minus className="size-4" />
              </button>
              <input
                inputMode="numeric"
                value={users}
                onChange={(e) => setUsers(Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1))}
                className="h-10 w-16 rounded-xl border border-zinc-200 text-center text-sm font-semibold tabular-nums outline-none focus:border-sky-500"
              />
              <button type="button" onClick={() => setUsers((u) => u + 1)} className="grid size-10 place-items-center rounded-xl border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50">
                <Plus className="size-4" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">
              {t("usersHint", { included: product.includedUsers, extra, price: fmt(product.extraUserPrice) })}
            </p>
          </div>

          {plan && (
            <div className={cn("flex items-center justify-between gap-3 rounded-xl border p-3.5", enough ? "border-emerald-200 bg-emerald-50/60" : "border-red-200 bg-red-50/60")}>
              <div className="space-y-0.5 text-sm text-zinc-500">
                <p>
                  {t("balance")}: <b className={enough ? "text-emerald-700" : "text-red-600"}>{fmt(balance)}</b>
                </p>
                {total !== null && (
                  <p>
                    {t("price")}: <b className="text-zinc-900">{fmt(total)} {t("uzs")}</b>
                  </p>
                )}
                {until && (
                  <p>
                    {t("until")}: <b className="text-zinc-900">{until}</b>
                  </p>
                )}
              </div>
              {enough ? (
                <CheckCircle2 className="size-6 shrink-0 text-emerald-500" />
              ) : (
                <button type="button" onClick={onTopUp} className="shrink-0 rounded-lg bg-red-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600">
                  {t("topUp")}
                </button>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>
                {error}
                {insufficient && (
                  <button type="button" onClick={onTopUp} className="ml-2 font-semibold underline">
                    {t("topUp")}
                  </button>
                )}
              </span>
            </p>
          )}

          <SubmitButton loading={loading} disabled={!plan || !enough}>
            {t("submit")}
          </SubmitButton>
        </form>
      )}
    </Modal>
  );
}

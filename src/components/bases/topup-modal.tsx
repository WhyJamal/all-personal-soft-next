"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { bff, errorMessage } from "@/lib/api/bff";
import { Modal } from "@/components/ui/modal";
import { INTL_LOCALE } from "@/components/profile/format";

const PRESETS = [50_000, 100_000, 200_000, 500_000];
const SERVICE_ID = process.env.NEXT_PUBLIC_CLICK_SERVICE_ID;
const MERCHANT_ID = process.env.NEXT_PUBLIC_CLICK_MERCHANT_ID;

export function TopUpModal({ open, onClose, orgInn }: { open: boolean; onClose: () => void; orgInn: string }) {
  const t = useTranslations("manage");
  const locale = useLocale();
  const fmt = (n: number) => new Intl.NumberFormat(INTL_LOCALE[locale] ?? locale).format(n);

  const [preset, setPreset] = useState(PRESETS[1]);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amount = custom ? Number(custom) : preset;

  async function pay() {
    if (!SERVICE_ID || !MERCHANT_ID) return setError(t("topup.notConfigured"));
    if (!(amount >= 1000)) return setError(t("topup.min"));
    setError("");
    setLoading(true);
    try {
      const res = await bff.post<{ merchant_trans_id: string; amount: number | string }>("payments/click/create/", {
        organization_id: orgInn,
        wallet_topup: true,
        amount,
      });
      const params = new URLSearchParams({
        service_id: SERVICE_ID,
        merchant_id: MERCHANT_ID,
        amount: String(res.amount),
        transaction_param: res.merchant_trans_id,
        return_url: `${window.location.origin}/payment/success`,
      });
      window.location.href = `https://my.click.uz/services/pay?${params}`; // leaves the site, keep the spinner
    } catch (e) {
      setError(errorMessage(e, t("common.error")));
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("topup.title")}>
      <p className="text-xs font-medium text-zinc-500">{t("topup.amount")}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {PRESETS.map((p) => {
          const on = !custom && preset === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => { setPreset(p); setCustom(""); }}
              className={cn(
                "rounded-xl border px-4 py-3 text-left text-sm font-semibold tabular-nums transition-all",
                on ? "border-sky-500 bg-sky-50 text-sky-700 ring-4 ring-sky-500/10" : "border-zinc-200 text-zinc-800 hover:border-zinc-300"
              )}
            >
              {fmt(p)} <span className="text-xs font-normal text-zinc-400">{t("create.uzs")}</span>
            </button>
          );
        })}
      </div>

      <input
        inputMode="numeric"
        value={custom}
        onChange={(e) => setCustom(e.target.value.replace(/\D/g, "").slice(0, 10))}
        placeholder={t("topup.custom")}
        className="mt-3 h-11 w-full rounded-xl border border-zinc-200 px-3.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
      />

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(2_132_199/0.6)] transition-all hover:bg-sky-500 active:translate-y-px disabled:opacity-70"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {t("topup.pay")} · {fmt(amount || 0)}
      </button>
    </Modal>
  );
}

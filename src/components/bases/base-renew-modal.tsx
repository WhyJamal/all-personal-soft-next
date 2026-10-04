"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { bff, errorMessage } from "@/lib/api/bff";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { INTL_LOCALE } from "@/components/profile/format";
import type { ProfileProduct } from "@/lib/profile/types";
import { isMonthly } from "@/lib/price";
import { PeriodPicker } from "./period-picker";
import { UsersBlock, type OneCUser } from "./users-block";

type ApiPlan = { id: number; name: string; price: string | number; duration_days?: number; is_active: boolean; product: number };
type UsersInfo = { included_users?: number; extra_user_price?: string | number; user_count?: number; users?: OneCUser[] };

const base = (id: number) => `organizations/product/add/${id}/`;

function Inner({ product, balance, onTopUp, onClose }: { product: ProfileProduct; balance: number; onTopUp: () => void; onClose: () => void }) {
  const t = useTranslations("manage");
  const tr = useTranslations("manage.renew");
  const ts = useTranslations("manage.settings");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const fmt = (n: number) => new Intl.NumberFormat(INTL_LOCALE[locale] ?? locale, { maximumFractionDigits: 0 }).format(n);

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [info, setInfo] = useState<UsersInfo>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [months, setMonths] = useState(1);
  const [users, setUsers] = useState<OneCUser[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [extra, setExtra] = useState(0);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([bff.get<ApiPlan[] | { results: ApiPlan[] }>("plans/"), bff.get<UsersInfo>(`${base(product.id)}users/`)])
      .then(([p, i]) => {
        if (!alive) return;
        setPlans(Array.isArray(p) ? p : p.results ?? []);
        setInfo(i);
        const list = i.users ?? [];
        setUsers(list);
        const active = list.filter((u) => u.is_active);
        setChecked(new Set(active.map((u) => u.id)));
        setExtra(Math.max(0, Number(i.user_count ?? 1) - active.length));
      })
      .catch(() => alive && setFailed(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [product.id]);

  const productPlans = useMemo(() => plans.filter((p) => p.is_active && p.product === product.productId), [plans, product.productId]);
  const included = Number(info.included_users ?? 1);
  const extraPrice = Number(info.extra_user_price ?? 0);
  const target = checked.size + extra;
  const extraCost = Math.max(0, target - included) * extraPrice;
  const plan = productPlans.find((p) => p.id === selected);
  // A plan that is not a 30-day plan is bought as it is, one period at a time.
  const termOf = (p: ApiPlan) => (isMonthly(p.duration_days ?? 30) ? months : 1);
  const totalOf = (p: ApiPlan) => (Number(p.price) + extraCost) * termOf(p);
  const total = plan ? totalOf(plan) : 0;
  const enough = !!plan && balance >= total;

  async function toggleUser(u: OneCUser) {
    const next = !checked.has(u.id);
    setToggling(u.id);
    setError("");
    try {
      await bff.post(`${base(product.id)}users/toggle/`, { id: u.id, status: next });
      setChecked((s) => {
        const n = new Set(s);
        if (next) n.add(u.id);
        else n.delete(u.id);
        return n;
      });
    } catch {
      setError(ts("onecFailed"));
    } finally {
      setToggling(null);
    }
  }

  async function pay() {
    if (!plan || !enough) return;
    setPaying(true);
    setError("");
    try {
      await bff.post("payments/click/renew/", { org_product_id: product.id, plan_id: plan.id, user_count: target, months: termOf(plan) });
      toast(tr("done"), "success");
      router.refresh();
      onClose();
    } catch (e) {
      setError(errorMessage(e, tr("failed")));
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-14 text-zinc-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  if (failed) return <p className="py-10 text-center text-sm text-red-500">{ts("loadFailed")}</p>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-sky-50/70 px-4 py-3 text-center">
        <p className="text-sm font-semibold text-zinc-800">{product.title || product.productName}</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {tr("balance")}: <b className="text-zinc-800">{fmt(balance)} {t("create.uzs")}</b>
        </p>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-zinc-700">{tr("choosePlan")}</p>
        <div className="space-y-2">
          {productPlans.map((p) => {
            const affordable = balance >= totalOf(p);
            const on = p.id === selected;
            return (
              <button
                key={p.id}
                type="button"
                disabled={!affordable}
                onClick={() => setSelected(p.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                  on ? "border-sky-500 bg-sky-50/70 ring-4 ring-sky-500/10" : affordable ? "border-zinc-200 hover:border-zinc-300" : "cursor-not-allowed border-zinc-100 bg-zinc-50 opacity-60"
                )}
              >
                <span className="text-sm font-semibold text-zinc-900">{p.name}</span>
                <span className={cn("text-right text-sm font-semibold tabular-nums", affordable ? "text-zinc-900" : "text-red-500")}>
                  {fmt(Number(p.price) * termOf(p))} <span className="text-xs font-normal opacity-70">{t("create.uzs")}</span>
                  {!affordable && <span className="block text-[11px] font-normal">{tr("notEnough")}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {productPlans.some((p) => isMonthly(p.duration_days ?? 30)) && <PeriodPicker value={months} onChange={setMonths} />}

      <UsersBlock users={users} checked={checked} toggling={toggling} onToggle={toggleUser} extra={extra} setExtra={setExtra} included={included} target={target} />

      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</p>}

      {plan && !enough && (
        <button type="button" onClick={onTopUp} className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50">
          {tr("topUp")}
        </button>
      )}

      <button
        type="button"
        onClick={pay}
        disabled={paying || !enough}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(2_132_199/0.6)] transition-all hover:bg-sky-500 active:translate-y-px disabled:opacity-50"
      >
        {paying && <Loader2 className="size-4 animate-spin" />}
        {plan ? tr("pay", { amount: `${fmt(total)} ${t("create.uzs")}` }) : tr("selectPlan")}
      </button>
    </div>
  );
}

export function BaseRenewModal({ product, balance, onTopUp, onClose }: { product: ProfileProduct | null; balance: number; onTopUp: () => void; onClose: () => void }) {
  const tr = useTranslations("manage.renew");
  return (
    <Modal open={!!product} onClose={onClose} title={tr("title")} className="max-w-lg">
      {product && <Inner key={product.id} product={product} balance={balance} onTopUp={onTopUp} onClose={onClose} />}
    </Modal>
  );
}

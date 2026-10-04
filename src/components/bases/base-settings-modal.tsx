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
import { UsersBlock, type OneCUser } from "./users-block";
import type { ProfileProduct } from "@/lib/profile/types";

type ApiPlan = { id: number; name: string; price: string | number; duration_days: number; is_active: boolean; product: number };
type Info = {
  current_plan_id?: number | null;
  current_plan_price?: string | number;
  current_plan_duration_days?: number;
  remaining_days?: number;
  included_users?: number;
  extra_user_price?: string | number;
  user_count?: number;
  users?: OneCUser[];
};

const base = (id: number) => `organizations/product/add/${id}/`;

function Inner({ product, onClose }: { product: ProfileProduct; onClose: () => void }) {
  const t = useTranslations("manage");
  const ts = useTranslations("manage.settings");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const fmt = (n: number) => new Intl.NumberFormat(INTL_LOCALE[locale] ?? locale, { maximumFractionDigits: 0 }).format(n);

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [info, setInfo] = useState<Info>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [users, setUsers] = useState<OneCUser[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [extra, setExtra] = useState(0);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([bff.get<ApiPlan[] | { results: ApiPlan[] }>("plans/"), bff.get<Info>(`${base(product.id)}settings-info/`)])
      .then(([p, i]) => {
        if (!alive) return;
        setPlans(Array.isArray(p) ? p : p.results ?? []);
        setInfo(i);
        setSelected(i.current_plan_id ?? null);
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
  const plan = productPlans.find((p) => p.id === selected);

  const included = Number(info.included_users ?? 1);
  const extraPrice = Number(info.extra_user_price ?? 0);
  const curPrice = Number(info.current_plan_price ?? 0);
  const curDays = Number(info.current_plan_duration_days ?? 30) || 30;
  const remaining = Number(info.remaining_days ?? 0);
  const target = checked.size + extra;

  const oldDaily = (curPrice + Math.max(0, Number(info.user_count ?? 1) - included) * extraPrice) / curDays;
  const newDaily = ((plan ? Number(plan.price) : curPrice) + Math.max(0, target - included) * extraPrice) / ((plan?.duration_days ?? curDays) || 30);
  const charge = Math.max(0, newDaily - oldDaily) * remaining;

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

  async function apply() {
    setApplying(true);
    setError("");
    try {
      const res = await bff.post<{ message?: string; user_count?: number; plan_id?: number }>(`${base(product.id)}settings-apply/`, {
        plan_id: selected ?? undefined,
        user_count: target,
      });
      toast(res.message ?? ts("applied"), "success");
      router.refresh();
      onClose();
    } catch (e) {
      setError(errorMessage(e, ts("applyFailed")));
    } finally {
      setApplying(false);
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
      <p className="text-xs leading-relaxed text-zinc-500">{ts("note", { days: remaining })}</p>

      <div>
        <p className="mb-1.5 text-sm font-medium text-zinc-700">{ts("plan")}</p>
        <div className="space-y-2">
          {productPlans.map((p) => {
            const on = p.id === selected;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                  on ? "border-sky-500 bg-sky-50/70 ring-4 ring-sky-500/10" : "border-zinc-200 hover:border-zinc-300"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                  {p.name}
                  {p.id === info.current_plan_id && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">{ts("current")}</span>
                  )}
                </span>
                <span className="text-sm font-semibold tabular-nums text-zinc-900">
                  {fmt(Number(p.price))} <span className="text-xs font-normal text-zinc-400">{t("create.uzs")}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <UsersBlock users={users} checked={checked} toggling={toggling} onToggle={toggleUser} extra={extra} setExtra={setExtra} included={included} target={target} />

      <div className="rounded-xl bg-sky-50 px-4 py-3 text-xs leading-relaxed text-sky-800">
        {ts("breakdown", { old: fmt(oldDaily), new: fmt(newDaily) })}
        <br />
        {ts("charge")}: <b>{fmt(charge)} {t("create.uzs")}</b>
        {charge === 0 && ` (${ts("noCharge")})`}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={apply}
        disabled={applying}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(2_132_199/0.6)] transition-all hover:bg-sky-500 active:translate-y-px disabled:opacity-70"
      >
        {applying && <Loader2 className="size-4 animate-spin" />}
        {ts("apply")}
      </button>
    </div>
  );
}

export function BaseSettingsModal({ product, onClose }: { product: ProfileProduct | null; onClose: () => void }) {
  const t = useTranslations("manage.settings");
  return (
    <Modal open={!!product} onClose={onClose} title={product ? `${t("title")} · ${product.title}` : t("title")} className="max-w-lg">
      {product && <Inner key={product.id} product={product} onClose={onClose} />}
    </Modal>
  );
}

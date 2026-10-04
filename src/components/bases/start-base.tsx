"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { bff } from "@/lib/api/bff";
import { parseMe, type MeLite } from "@/lib/bases/me";
import { Modal } from "@/components/ui/modal";
import { CreateOrgModal } from "@/components/profile/create-org-modal";
import { CreateBaseModal, type StartProduct } from "./create-base-modal";
import { TopUpModal } from "./topup-modal";

type Ctx = {
  product: StartProduct;
  start: (planId?: number, months?: number) => void;
  goToBase: () => void;
  hasBases: boolean;
};

const StartCtx = createContext<Ctx | null>(null);
const useStart = () => {
  const ctx = useContext(StartCtx);
  if (!ctx) throw new Error("Start-base buttons must be inside <StartBaseProvider>");
  return ctx;
};

/** Owns the whole "create a base" flow of a product page: sign-in → organization → plan → payment. */
export function StartBaseProvider({ product, children }: { product: StartProduct; children: ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("manage.start");

  const [me, setMe] = useState<MeLite | null>(null);
  const [modal, setModal] = useState<null | "org" | "create" | "topup" | "bases">(null);
  const [planId, setPlanId] = useState<number | undefined>();
  const [months, setMonths] = useState(1);

  const load = useCallback(async () => {
    const data = parseMe(await bff.get("users/me/"));
    setMe(data);
    return data;
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    let alive = true;
    bff
      .get("users/me/")
      .then((raw) => alive && setMe(parseMe(raw as Parameters<typeof parseMe>[0])))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [status]);

  const mine = useMemo(() => (me?.bases ?? []).filter((b) => b.productId === product.id), [me, product.id]);

  const start = useCallback(
    async (plan?: number, term = 1) => {
      if (status !== "authenticated") return router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      setPlanId(plan);
      setMonths(term);
      try {
        const data = me ?? (await load());
        setModal(data.org ? "create" : "org");
      } catch {
        setModal("org");
      }
    },
    [status, me, load, router, pathname]
  );

  const goToBase = useCallback(() => {
    if (mine.length === 1) window.open(mine[0].url, "_blank", "noopener,noreferrer");
    else if (mine.length > 1) setModal("bases");
  }, [mine]);

  const value = useMemo(() => ({ product, start, goToBase, hasBases: mine.length > 0 }), [product, start, goToBase, mine.length]);

  return (
    <StartCtx.Provider value={value}>
      {children}

      <CreateOrgModal
        open={modal === "org"}
        onClose={() => setModal(null)}
        onCreated={() => load().then(() => setModal("create")).catch(() => {})}
      />

      {me?.org && (
        <>
          <CreateBaseModal
            // remount per opening so the form always starts clean
            key={`${modal === "create"}-${planId ?? 0}-${months}`}
            open={modal === "create"}
            onClose={() => setModal(null)}
            product={product}
            org={me.org}
            balance={me.walletBalance}
            initialPlanId={planId}
            initialMonths={months}
            onTopUp={() => setModal("topup")}
            onCreated={() => load().catch(() => {})}
          />
          <TopUpModal open={modal === "topup"} onClose={() => load().catch(() => {}).then(() => setModal("create"))} orgInn={me.org.inn} />
        </>
      )}

      <Modal open={modal === "bases"} onClose={() => setModal(null)} title={t("basesTitle")} className="max-w-lg">
        <ul className="space-y-2">
          {mine.map((b) => (
            <li key={b.id}>
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 px-4 py-3 transition-colors hover:border-sky-300 hover:bg-sky-50/50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-zinc-900">{b.title || product.title}</span>
                  {b.plan && <span className="text-xs text-zinc-500">{b.plan}</span>}
                </span>
                <ChevronRight className="size-4 shrink-0 text-zinc-400" />
              </a>
            </li>
          ))}
        </ul>
      </Modal>
    </StartCtx.Provider>
  );
}

export function StartBaseButton({ className }: { className?: string }) {
  const { start, product } = useStart();
  const t = useTranslations("manage.start");
  return (
    <button type="button" onClick={() => start()} disabled={!product.isActive || product.plans.length === 0} className={cn(className, "disabled:cursor-not-allowed disabled:opacity-50")}>
      <Plus className="size-4" />
      {t("create")}
    </button>
  );
}

export function GoToBaseButton({ className }: { className?: string }) {
  const { goToBase, hasBases } = useStart();
  const t = useTranslations("manage.start");
  if (!hasBases) return null;
  return (
    <button type="button" onClick={goToBase} className={className}>
      {t("goToBase")}
      <ChevronRight className="size-4" />
    </button>
  );
}

export function PlanChooseButton({ planId, months = 1, className, label }: { planId: number; months?: number; className?: string; label: string }) {
  const { start, product } = useStart();
  return (
    <button type="button" onClick={() => start(planId, months)} disabled={!product.isActive} className={cn(className, "disabled:cursor-not-allowed disabled:opacity-50")}>
      {label}
    </button>
  );
}

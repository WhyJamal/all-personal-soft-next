"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Reorder, useDragControls, type DragControls } from "motion/react";
import Link from "next/link";
import { Archive, ArrowUpCircle, ChevronRight, GripVertical, Pencil, RefreshCw, Settings2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { bff, errorMessage } from "@/lib/api/bff";
import { ConfirmDialog } from "@/components/ui/modal";
import { HoverEffect } from "@/components/ui/hover-effect";
import { useToast } from "@/components/ui/toast";
import { BaseSettingsModal } from "@/components/bases/base-settings-modal";
import { BaseRenewModal } from "@/components/bases/base-renew-modal";
import { TopUpModal } from "@/components/bases/topup-modal";
import type { ProfileProduct } from "@/lib/profile/types";
import { StatusPill } from "./status-pill";
import { daysLeft, formatDate, progressOf, statusOf } from "./format";
import type { ViewMode } from "./use-view-mode";

export type BaseFilter = "all" | "active" | "expired";

const byOrder = (a: ProfileProduct, b: ProfileProduct) => a.order - b.order || a.id - b.id;
const path = (id: number, tail = "") => `organizations/product/add/${id}/${tail}`;
const BAR = { active: "bg-sky-500", expiring: "bg-amber-500", expired: "bg-zinc-300" } as const;

type ItemProps = {
  p: ProfileProduct;
  now: number;
  onChosen: (p: ProfileProduct) => void;
  onRename: (p: ProfileProduct, title: string) => Promise<void>;
  onArchive: (p: ProfileProduct) => void;
  onSettings: (p: ProfileProduct) => void;
  onRenew: (p: ProfileProduct) => void;
};

/** Inline rename: returns what the title area needs. */
function useRename(p: ProfileProduct, onRename: ItemProps["onRename"]) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(p.title);
  const cancelled = useRef(false);

  async function commit() {
    setEditing(false);
    const next = title.trim();
    if (cancelled.current || !next || next === p.title) {
      cancelled.current = false;
      setTitle(p.title);
      return;
    }
    try {
      await onRename(p, next);
    } catch {
      setTitle(p.title);
    }
  }

  const field = (
    <input
      autoFocus
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      onBlur={commit}
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          cancelled.current = true;
          e.currentTarget.blur();
        }
      }}
      className="w-full border-b border-sky-400 bg-transparent pb-0.5 text-sm font-semibold text-zinc-900 outline-none"
    />
  );
  return { editing, start: () => setEditing(true), field };
}

const iconBtn = "grid size-8 place-items-center rounded-lg text-zinc-400 transition-colors";

function Actions({ p, expired, start, onArchive, onSettings, onRenew }: Pick<ItemProps, "p" | "onArchive" | "onSettings" | "onRenew"> & { expired: boolean; start: () => void }) {
  const t = useTranslations("manage.bases");
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {expired && (
        <button
          type="button"
          onClick={() => onRenew(p)}
          className="mr-1 inline-flex h-8 items-center gap-1.5 rounded-lg bg-amber-50 px-3 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
        >
          <RefreshCw className="size-3.5" />
          {t("renew")}
        </button>
      )}
      {!expired && p.url && (
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mr-1 inline-flex h-8 items-center gap-0.5 rounded-lg px-2.5 text-xs font-semibold text-sky-600 transition-colors hover:bg-sky-50"
        >
          {t("open")}
          <ChevronRight className="size-3.5" />
        </a>
      )}
      <button type="button" onClick={start} aria-label={t("rename")} title={t("rename")} className={cn(iconBtn, "hover:bg-zinc-100 hover:text-zinc-700")}>
        <Pencil className="size-3.5" />
      </button>
      {p.productName && (
        <Link
          href={`/updates/${encodeURIComponent(p.productName)}/${p.id}`}
          aria-label={t("updates")}
          title={t("updates")}
          className={cn(iconBtn, "hover:bg-sky-50 hover:text-sky-600")}
        >
          <ArrowUpCircle className="size-3.5" />
        </Link>
      )}
      {!expired && (
        <button type="button" onClick={() => onSettings(p)} aria-label={t("settings")} title={t("settings")} className={cn(iconBtn, "hover:bg-zinc-100 hover:text-zinc-700")}>
          <Settings2 className="size-3.5" />
        </button>
      )}
      <button type="button" onClick={() => onArchive(p)} aria-label={t("archive")} title={t("archive")} className={cn(iconBtn, "hover:bg-red-50 hover:text-red-600")}>
        <Archive className="size-3.5" />
      </button>
    </div>
  );
}

function StarButton({ p, onChosen }: Pick<ItemProps, "p" | "onChosen">) {
  const t = useTranslations("manage.bases");
  return (
    <button
      type="button"
      onClick={() => onChosen(p)}
      aria-label={p.chosen ? t("unfavorite") : t("favorite")}
      aria-pressed={p.chosen}
      className="grid size-7 shrink-0 place-items-center rounded-lg hover:bg-amber-50"
    >
      <Star className={cn("size-4 transition-colors", p.chosen ? "fill-amber-400 text-amber-400" : "text-zinc-300 hover:text-amber-300")} />
    </button>
  );
}

function BaseRow({ controls, ...props }: ItemProps & { controls?: DragControls }) {
  const { p, now, onChosen, onRename, onArchive, onSettings, onRenew } = props;
  const t = useTranslations("manage.bases");
  const tp = useTranslations("profile");
  const locale = useLocale();
  const status = statusOf(p.end, now);
  const expired = status === "expired";
  const rename = useRename(p, onRename);
  const meta = [p.productName, p.plan, p.version && `v${p.version}`].filter(Boolean).join(" · ");

  return (
    <div className={cn("flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-3 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 sm:gap-3 sm:p-4", expired && "bg-zinc-50/70")}>
      {controls ? (
        <button
          type="button"
          aria-label={t("drag")}
          onPointerDown={(e) => controls.start(e)}
          className="grid size-7 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-zinc-300 hover:bg-zinc-100 hover:text-zinc-500 active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>
      ) : (
        <span className="size-7 shrink-0" />
      )}
      <StarButton p={p} onChosen={onChosen} />

      <div className="min-w-0 flex-1">
        {rename.editing ? (
          rename.field
        ) : (
          <p className={cn("truncate text-sm font-semibold", expired ? "text-zinc-500" : "text-zinc-900")} title={p.title}>
            {p.title || "—"}
          </p>
        )}
        <p className="mt-0.5 truncate text-xs text-zinc-500">{meta}</p>
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <StatusPill status={status} />
        <span className="text-xs text-zinc-400">
          {tp("products.until", { date: formatDate(p.end, locale) })}
          {!expired && ` · ${tp("days", { count: daysLeft(p.end, now) })}`}
        </span>
      </div>

      <Actions p={p} expired={expired} start={rename.start} onArchive={onArchive} onSettings={onSettings} onRenew={onRenew} />
    </div>
  );
}

function BaseCard(props: ItemProps) {
  const { p, now, onChosen, onRename, onArchive, onSettings, onRenew } = props;
  const tp = useTranslations("profile");
  const locale = useLocale();
  const status = statusOf(p.end, now);
  const expired = status === "expired";
  const rename = useRename(p, onRename);
  const meta = [p.productName, p.plan, p.version && `v${p.version}`].filter(Boolean).join(" · ");

  return (
    <article className={cn("flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-zinc-900/5", expired && "bg-zinc-50/70")}>
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-sky-500 to-indigo-600 text-sm font-semibold text-white">
          {(p.title.trim()[0] ?? "?").toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          {rename.editing ? (
            rename.field
          ) : (
            <h3 className={cn("truncate text-sm font-semibold", expired ? "text-zinc-500" : "text-zinc-900")} title={p.title}>
              {p.title || "—"}
            </h3>
          )}
          <p className="truncate text-xs text-zinc-500">{meta}</p>
        </div>
        <StarButton p={p} onChosen={onChosen} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <StatusPill status={status} />
        <span className="text-xs text-zinc-400">
          {tp("products.until", { date: formatDate(p.end, locale) })}
        </span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className={cn("h-full rounded-full", BAR[status])} style={{ width: `${Math.round(progressOf(p.start, p.end, now) * 100)}%` }} />
      </div>
      {!expired && <p className="mt-2 text-xs text-zinc-400">{tp("days", { count: daysLeft(p.end, now) })}</p>}

      <div className="mt-auto flex justify-end pt-4">
        <Actions p={p} expired={expired} start={rename.start} onArchive={onArchive} onSettings={onSettings} onRenew={onRenew} />
      </div>
    </article>
  );
}

function SortableRow({ value, onDragEnd, ...rest }: ItemProps & { value: ProfileProduct; onDragEnd: () => void }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="li"
      value={value}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.01, boxShadow: "0 18px 40px -12px rgb(0 0 0 / 0.18)", zIndex: 10 }}
      className="relative list-none"
      onDragEnd={onDragEnd}
    >
      <BaseRow {...rest} controls={controls} />
    </Reorder.Item>
  );
}

export function BaseList({ products, now, filter, view, balance, orgInn }: { products: ProfileProduct[]; now: number; filter: BaseFilter; view: ViewMode; balance: number; orgInn: string }) {
  const t = useTranslations("manage");
  const { toast } = useToast();
  const router = useRouter();

  const [items, setItems] = useState(() => [...products].sort(byOrder));
  const latest = useRef(items);
  const [toArchive, setToArchive] = useState<ProfileProduct | null>(null);
  const [settingsFor, setSettingsFor] = useState<ProfileProduct | null>(null);
  const [renewFor, setRenewFor] = useState<ProfileProduct | null>(null);
  const [topUp, setTopUp] = useState(false);

  const patch = (id: number, changes: Partial<ProfileProduct>) => {
    const next = latest.current.map((x) => (x.id === id ? { ...x, ...changes } : x));
    latest.current = next;
    setItems(next);
  };

  async function toggleChosen(p: ProfileProduct) {
    patch(p.id, { chosen: !p.chosen });
    try {
      const res = await bff.post<{ chosen: boolean }>(path(p.id, "toggle-chosen/"));
      patch(p.id, { chosen: res.chosen });
    } catch (e) {
      patch(p.id, { chosen: p.chosen });
      toast(errorMessage(e, t("common.error")), "error");
    }
  }

  async function rename(p: ProfileProduct, title: string) {
    patch(p.id, { title });
    try {
      await bff.put(path(p.id), { title });
      toast(t("bases.saved"), "success");
      router.refresh();
    } catch (e) {
      patch(p.id, { title: p.title });
      toast(errorMessage(e, t("common.error")), "error");
      throw e;
    }
  }

  async function archive(p: ProfileProduct) {
    const before = latest.current;
    latest.current = before.filter((x) => x.id !== p.id);
    setItems(latest.current);
    try {
      await bff.put(path(p.id), { archive: true });
      toast(t("bases.archived"), "success");
      router.refresh();
    } catch (e) {
      latest.current = before;
      setItems(before);
      toast(errorMessage(e, t("common.error")), "error");
    }
  }

  async function saveOrder() {
    try {
      await bff.post("organizations/product/add/reorder/", { items: latest.current.map((x, i) => ({ id: x.id, order: i })) });
    } catch {
      toast(t("bases.reorderFailed"), "error");
    }
  }

  const shared = { now, onChosen: toggleChosen, onRename: rename, onArchive: setToArchive, onSettings: setSettingsFor, onRenew: setRenewFor };
  const visible = filter === "all" ? items : items.filter((p) => (statusOf(p.end, now) === "expired") === (filter === "expired"));

  return (
    <>
      {view === "list" && filter === "all" ? (
        <Reorder.Group as="ul" axis="y" values={items} onReorder={(next) => { latest.current = next; setItems(next); }} className="space-y-3">
          {items.map((p) => (
            <SortableRow key={p.id} value={p} p={p} {...shared} onDragEnd={saveOrder} />
          ))}
        </Reorder.Group>
      ) : view === "list" ? (
        <ul className="space-y-3">
          {visible.map((p) => (
            <li key={p.id} className="list-none">
              <BaseRow p={p} {...shared} />
            </li>
          ))}
        </ul>
      ) : (
        // each child becomes one cell; the cell's p-2 is cancelled by -m-2 so the grid lines up with the list view
        <HoverEffect key={filter} className="-m-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => (
            <BaseCard key={p.id} p={p} {...shared} />
          ))}
        </HoverEffect>
      )}

      <ConfirmDialog
        open={!!toArchive}
        danger
        title={t("bases.archiveTitle")}
        message={t("bases.archiveMessage", { name: toArchive?.title ?? "" })}
        confirmLabel={t("bases.archive")}
        onClose={() => setToArchive(null)}
        onConfirm={() => toArchive && archive(toArchive)}
      />
      <BaseSettingsModal product={settingsFor} onClose={() => setSettingsFor(null)} />
      <BaseRenewModal product={renewFor} balance={balance} onTopUp={() => setTopUp(true)} onClose={() => setRenewFor(null)} />
      <TopUpModal open={topUp} onClose={() => { setTopUp(false); router.refresh(); }} orgInn={orgInn} />
    </>
  );
}

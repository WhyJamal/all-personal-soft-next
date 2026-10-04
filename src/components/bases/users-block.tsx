"use client";

import { Check, Loader2, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type OneCUser = { id: string; name: string; is_active: boolean };

/** 1C users list + "total users" stepper, shared by the settings and renew dialogs. */
export function UsersBlock({
  users,
  checked,
  toggling,
  onToggle,
  extra,
  setExtra,
  included,
  target,
}: {
  users: OneCUser[];
  checked: Set<string>;
  toggling: string | null;
  onToggle: (u: OneCUser) => void;
  extra: number;
  setExtra: (fn: (n: number) => number) => void;
  included: number;
  target: number;
}) {
  const ts = useTranslations("manage.settings");
  const stepBtn = "grid size-10 place-items-center rounded-xl border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40";

  return (
    <div className="rounded-2xl border border-zinc-200 p-4">
      <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
        <span className="text-sm font-medium text-zinc-700">{ts("users")}</span>
        <span>
          {ts("included", { count: included })} · {ts("inactive", { count: users.length - checked.size })}
        </span>
      </div>

      {users.length > 0 && (
        <ul className="mb-3 max-h-40 divide-y divide-zinc-100 overflow-y-auto rounded-xl border border-zinc-100">
          {users.map((u) => {
            const on = checked.has(u.id);
            return (
              <li key={u.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="truncate text-zinc-800">{u.name || u.id}</span>
                <button
                  type="button"
                  onClick={() => onToggle(u)}
                  disabled={toggling === u.id}
                  aria-pressed={on}
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded border transition-colors disabled:opacity-50",
                    on ? "border-sky-600 bg-sky-600 text-white" : "border-zinc-300"
                  )}
                >
                  {toggling === u.id ? <Loader2 className="size-3 animate-spin" /> : on ? <Check className="size-3" strokeWidth={3} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setExtra((c) => Math.max(0, c - 1))} disabled={extra <= 0} className={stepBtn}>
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center text-base font-semibold tabular-nums">{target}</span>
        <button type="button" onClick={() => setExtra((c) => c + 1)} className={stepBtn}>
          <Plus className="size-4" />
        </button>
        <span className="text-xs text-zinc-400">{ts("total")}</span>
      </div>
      <p className="mt-2 text-xs text-zinc-400">{ts("hint")}</p>
    </div>
  );
}

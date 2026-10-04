"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, ArrowLeft, Calendar, CheckCircle2, ChevronDown, Download, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BffError, bff } from "@/lib/api/bff";
import { Modal } from "@/components/ui/modal";
import { INTL_LOCALE } from "@/components/profile/format";
import { GlowCard } from "@/components/profile/glow-card";
import type { ProductVersion } from "@/lib/updates/server";

type Status = "loading" | "success" | "error" | "busy";

export function UpdatesView({
  base,
  versions,
}: {
  base: { id: number; title: string; productName: string; version: string | null };
  versions: ProductVersion[];
}) {
  const t = useTranslations("manage.updates");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(versions[0]?.id ?? null);
  const [dialog, setDialog] = useState<{ status: Status; message?: string } | null>(null);

  const date = (iso: string) => new Intl.DateTimeFormat(INTL_LOCALE[locale] ?? locale, { dateStyle: "long" }).format(new Date(iso));

  async function install(v: ProductVersion) {
    setDialog({ status: "loading" });
    try {
      await bff.post("organizations/product/update-version/", { organization_product_id: base.id, version_id: v.id });
      setDialog({ status: "success" });
      router.refresh(); // pulls the new "current version"
    } catch (e) {
      const data = e instanceof BffError ? (e.data as { code?: string; message?: string } | null) : null;
      setDialog(data?.code === "database_busy" ? { status: "busy" } : { status: "error", message: data?.message });
    }
  }

  const close = () => setDialog(null);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-8 sm:px-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="size-4" />
        {t("back")}
      </button>

      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">{t("title")}</h1>
      <p className="mt-1.5 text-sm text-zinc-500">
        {base.title} <span className="text-zinc-300">·</span> {base.productName}
      </p>

      {/* Current version */}
      <GlowCard dark className="mt-8 p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 size-52 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="relative">
          <p className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            <CheckCircle2 className="size-3.5 text-emerald-400" />
            {t("current")}
          </p>
          <p className="mt-3 text-4xl font-semibold tracking-tight tabular-nums">v{base.version ?? "—"}</p>
        </div>
      </GlowCard>

      {/* Timeline */}
      {versions.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-400">{t("empty")}</p>
      ) : (
        <ol className="relative mt-10 space-y-4 before:absolute before:bottom-3 before:left-2.75 before:top-3 before:w-px before:bg-zinc-200">
          {versions.map((v, i) => {
            const isCurrent = base.version === v.version;
            const isOpen = open === v.id;
            return (
              <li key={v.id} className="relative pl-9">
                <span
                  className={cn(
                    "absolute left-0 top-6 grid size-6 place-items-center rounded-full border-2 bg-zinc-50",
                    isCurrent ? "border-emerald-500" : i === 0 ? "border-sky-500" : "border-zinc-300"
                  )}
                >
                  <span className={cn("size-2 rounded-full", isCurrent ? "bg-emerald-500" : i === 0 ? "bg-sky-500" : "bg-zinc-300")} />
                </span>

                <div className={cn("overflow-hidden rounded-3xl border bg-white transition-shadow", isOpen ? "border-sky-200 shadow-lg shadow-sky-900/5" : "border-zinc-200 hover:shadow-md hover:shadow-zinc-900/5")}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : v.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">v{v.version}</h2>
                        {i === 0 && <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700">{t("latest")}</span>}
                        {isCurrent && <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">{t("current")}</span>}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                        <Calendar className="size-3" />
                        {date(v.createdAt)}
                      </p>
                    </div>
                    <ChevronDown className={cn("size-5 shrink-0 text-zinc-400 transition-transform", isOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-zinc-100 px-5 pb-5 pt-4">
                          {v.description && (
                            <div className="mb-5">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">{t("info")}</p>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{v.description}</p>
                            </div>
                          )}

                          {v.media.length > 0 ? (
                            <div className="grid gap-3">
                              {v.media.map((m) => (
                                <div key={m.id} className="overflow-hidden rounded-2xl border border-zinc-200">
                                  {m.type === "image" && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.url} alt="" loading="lazy" className="max-h-96 w-full object-cover" />
                                  )}
                                  {m.type === "video" && <video controls preload="metadata" src={m.url} className="w-full" />}
                                  {m.type === "file" && (
                                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-4 text-sm font-medium text-sky-600 hover:underline">
                                      <Download className="size-4" />
                                      {t("download")}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-400">{t("noMedia")}</p>
                          )}

                          {!isCurrent && (
                            <div className="mt-6 flex justify-end">
                              <button
                                type="button"
                                onClick={() => install(v)}
                                className="inline-flex h-10 items-center gap-2 rounded-xl bg-sky-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(2_132_199/0.6)] transition-all hover:bg-sky-500 active:translate-y-px"
                              >
                                <Download className="size-4" />
                                {t("install")}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <Modal open={!!dialog} onClose={close} closable={dialog?.status !== "loading"} className="max-w-md">
        {dialog?.status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="size-12 animate-spin text-sky-500" />
            <h3 className="text-lg font-semibold text-zinc-900">{t("installing")}</h3>
            <p className="text-sm text-zinc-500">{t("installingText")}</p>
          </div>
        )}
        {dialog?.status === "success" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="size-12 text-emerald-500" />
            <h3 className="text-lg font-semibold text-zinc-900">{t("success")}</h3>
            <p className="text-sm text-zinc-500">{t("successText")}</p>
            <button type="button" onClick={close} className="mt-2 rounded-xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-600">
              {t("great")}
            </button>
          </div>
        )}
        {dialog?.status === "busy" && (
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-7 shrink-0 text-amber-500" />
              <h3 className="text-lg font-semibold text-zinc-900">{t("busyTitle")}</h3>
            </div>
            <p className="text-sm text-zinc-600">{t("busyText")}</p>
            <ul className="space-y-2 text-sm text-zinc-700">
              {["busy1", "busy2", "busy3"].map((k, i) => (
                <li key={k} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700">{i + 1}</span>
                  {t(k)}
                </li>
              ))}
            </ul>
            <button type="button" onClick={close} className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">
              {t("understood")}
            </button>
          </div>
        )}
        {dialog?.status === "error" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <XCircle className="size-12 text-red-500" />
            <h3 className="text-lg font-semibold text-zinc-900">{t("error")}</h3>
            {dialog.message && <p className="text-sm text-zinc-500">{dialog.message}</p>}
            <button type="button" onClick={close} className="mt-2 rounded-xl bg-zinc-900 px-6 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
              {t("understood")}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

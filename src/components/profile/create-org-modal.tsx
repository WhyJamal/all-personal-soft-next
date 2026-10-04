"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AlertCircle, Search } from "lucide-react";
import { bff, errorMessage } from "@/lib/api/bff";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { AuthInput } from "@/components/auth/auth-input";
import { SubmitButton } from "@/components/auth/submit-button";
import { OfertaContent } from "@/components/oferta-content";

const innOk = (inn: string) => inn.length === 9 || inn.length === 12;

export function CreateOrgModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const t = useTranslations("manage");
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", inn: "", address: "" });
  const [accepted, setAccepted] = useState(false);
  const [showOferta, setShowOferta] = useState(false);
  const [looking, setLooking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup() {
    if (!innOk(form.inn)) return setError(t("org.innError"));
    setError("");
    setLooking(true);
    try {
      const res = await fetch(`/api/inn?inn=${form.inn}`);
      const data = await res.json();
      if (data.found) {
        setForm((f) => ({ name: data.name || f.name, inn: data.inn || f.inn, address: data.address || f.address }));
        toast(t("org.found"), "success");
      } else {
        toast(t("org.notFound"), "info");
      }
    } catch {
      toast(t("org.notFound"), "info");
    } finally {
      setLooking(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!innOk(form.inn)) return setError(t("org.innError"));
    if (!accepted) return setError(t("org.ofertaRequired"));
    setError("");
    setLoading(true);
    try {
      await bff.post("organizations/", {
        name: form.name.trim(),
        inn: form.inn,
        address: form.address.trim(),
        owner: Number(session?.user.id),
        oferta_accepted: true,
        invite_code: sessionStorage.getItem("invite_code") ?? "",
      });
      sessionStorage.removeItem("invite_code");
      toast(t("org.created"), "success");
      router.refresh();
      onCreated?.();
      onClose();
    } catch (err) {
      setError(errorMessage(err, t("common.error")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={t("org.modalTitle")}>
        <form onSubmit={onSubmit} className="space-y-4">
          <AuthInput
            name="name"
            label={t("org.name")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <AuthInput
                name="inn"
                label={t("org.inn")}
                inputMode="numeric"
                value={form.inn}
                onChange={(e) => setForm({ ...form, inn: e.target.value.replace(/\D/g, "").slice(0, 12) })}
                required
              />
            </div>
            <button
              type="button"
              onClick={lookup}
              disabled={looking}
              className="mb-0.5 flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"
            >
              <Search className="size-4" />
              {t("org.fill")}
            </button>
          </div>

          <AuthInput
            name="address"
            label={t("org.address")}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          <label className="flex cursor-pointer select-none items-start gap-2.5 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 size-4 rounded border-zinc-300 accent-sky-600"
            />
            <span>
              {t("org.ofertaPrefix")}{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowOferta(true);
                }}
                className="font-medium text-sky-600 underline-offset-2 hover:underline"
              >
                {t("org.ofertaLink")}
              </button>{" "}
              {t("org.ofertaSuffix")}
            </span>
          </label>

          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-600">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <SubmitButton loading={loading} disabled={!accepted}>
            {t("org.create")}
          </SubmitButton>
        </form>
      </Modal>

      <Modal open={showOferta} onClose={() => setShowOferta(false)} title={t("org.ofertaTitle")} className="max-w-2xl">
        <OfertaContent />
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setAccepted(true);
              setShowOferta(false);
            }}
            className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
          >
            {t("org.ofertaAccept")}
          </button>
        </div>
      </Modal>
    </>
  );
}

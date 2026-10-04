"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Camera, Check, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ProfileData } from "@/lib/profile/types";
import { Avatar } from "@/components/avatar";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";
import { GlowCard } from "./glow-card";

type Errors = Record<string, string>;
const MAX_AVATAR = 5 * 1024 * 1024;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <GlowCard className="p-6 sm:p-7">
      <h2 className="mb-5 text-sm font-semibold text-zinc-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </GlowCard>
  );
}

export function SettingsPanel({ me }: { me: ProfileData }) {
  const t = useTranslations("profile.settings");
  const { update } = useSession();
  const router = useRouter();

  const [v, setV] = useState({ username: me.username, email: me.email, phone: me.phone, bio: me.bio });
  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const dirty =
    v.username !== me.username || v.email !== me.email || v.phone !== me.phone || v.bio !== me.bio ||
    !!pw.next || !!file || removeAvatar;

  const shownAvatar = removeAvatar ? null : (preview ?? me.avatarUrl);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }));

  function pick(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/") || f.size > MAX_AVATAR) {
      setErrors((s) => ({ ...s, avatar: t("errors.avatarInvalid") }));
      return;
    }
    setErrors((s) => ({ ...s, avatar: "" }));
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setRemoveAvatar(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const local: Errors = {};
    if (!v.username.trim()) local.username = t("errors.required");
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) local.email = t("errors.emailInvalid");
    if (pw.next && pw.next.length < 8) local.password = t("errors.passwordShort");
    if (pw.next && pw.next !== pw.confirm) local.confirm = t("errors.mismatch");
    setErrors(local);
    setFormError(null);
    if (Object.keys(local).length) return;

    const fd = new FormData();
    fd.set("username", v.username.trim());
    fd.set("email", v.email.trim().toLowerCase());
    fd.set("phone_number", v.phone.trim());
    fd.set("bio", v.bio.trim());
    if (pw.next) fd.set("password", pw.next);
    if (file) fd.set("avatar", file);
    else if (removeAvatar) fd.set("delete_avatar", "1");

    setLoading(true);
    try {
      const res = await fetch("/api/me", { method: "PATCH", body: fd });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        const fields: Errors = {};
        const map: Record<string, string> = { username: "username", email: "email", phone_number: "phone", bio: "bio", password: "password", avatar: "avatar" };
        for (const [k, to] of Object.entries(map)) {
          const m = data.fields?.[k];
          if (Array.isArray(m) && m[0]) fields[to] = String(m[0]);
        }
        setErrors(fields);
        if (!Object.keys(fields).length) {
          const code = data.code === "AVATAR_INVALID" ? "avatarInvalid" : (data.code ?? "REQUEST_FAILED");
          setFormError(t.has(`errors.${code}`) ? code : "REQUEST_FAILED");
        }
        return;
      }

      const bust = data.user.avatarUrl
        ? `${data.user.avatarUrl}${data.user.avatarUrl.includes("?") ? "&" : "?"}v=${Date.now()}`
        : null;
      await update({ name: data.user.username, email: data.user.email, image: bust });
      setPw({ next: "", confirm: "" });
      setFile(null);
      setPreview(null);
      setRemoveAvatar(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
      router.refresh();
    } catch {
      setFormError("NETWORK");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto max-w-2xl space-y-4">
      <Section title={t("profile")}>
        {/* Photo */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => input.current?.click()}
            aria-label={t("upload")}
            className="group/avatar relative rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          >
            <Avatar name={v.username} src={shownAvatar} className="size-20 text-2xl" />
            <span className="absolute inset-0 grid place-items-center rounded-full bg-zinc-950/50 text-white opacity-0 transition-opacity group-hover/avatar:opacity-100">
              <Camera className="size-5" />
            </span>
          </button>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => input.current?.click()}
                className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                {t("upload")}
              </button>
              {shownAvatar && (
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); setRemoveAvatar(true); }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                  {t("remove")}
                </button>
              )}
            </div>
            <p className={errors.avatar ? "text-xs text-red-500" : "text-xs text-zinc-400"}>
              {errors.avatar || t("photoHint")}
            </p>
          </div>
          <input
            ref={input}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }}
          />
        </div>

        <AuthInput name="username" label={t("username")} value={v.username} onChange={set("username")} error={errors.username} autoComplete="name" />
        <AuthInput name="email" type="email" label={t("email")} value={v.email} onChange={set("email")} error={errors.email} autoComplete="email" />
        <AuthInput name="phone" type="tel" label={t("phone")} value={v.phone} onChange={set("phone")} error={errors.phone} placeholder="+998" autoComplete="tel" />

        <div className="space-y-1.5">
          <label htmlFor="bio" className="text-sm font-medium text-zinc-700">{t("bio")}</label>
          <textarea
            id="bio"
            rows={3}
            value={v.bio}
            onChange={set("bio")}
            placeholder={t("bioPh")}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
          />
          {errors.bio && <p role="alert" className="text-xs text-red-500">{errors.bio}</p>}
        </div>
      </Section>

      <Section title={t("security")}>
        <PasswordInput
          name="new-password"
          label={t("password")}
          hint={t("passwordHint")}
          value={pw.next}
          onChange={(e) => setPw((s) => ({ ...s, next: e.target.value }))}
          error={errors.password}
          autoComplete="new-password"
        />
        {pw.next && (
          <PasswordInput
            name="confirm-password"
            label={t("confirm")}
            value={pw.confirm}
            onChange={(e) => setPw((s) => ({ ...s, confirm: e.target.value }))}
            error={errors.confirm}
            autoComplete="new-password"
          />
        )}
      </Section>

      {formError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
          {t(`errors.${formError}`)}
        </p>
      )}

      <div className="flex items-center justify-end gap-4">
        <AnimatePresence>
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600"
            >
              <Check className="size-4" />
              {t("saved")}
            </motion.span>
          )}
        </AnimatePresence>
        <SubmitButton loading={loading} disabled={!dirty} className="w-auto px-8 disabled:cursor-not-allowed disabled:opacity-50">
          {t("save")}
        </SubmitButton>
      </div>
    </form>
  );
}

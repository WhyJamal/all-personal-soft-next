"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthInput } from "@/components/auth/auth-input";
import { PasswordInput } from "@/components/auth/password-input";
import { GoogleButton } from "@/components/auth/google-button";
import { SubmitButton } from "@/components/auth/submit-button";
import { registerAction } from "./actions";

type Field = "username" | "email" | "password";
type Errors = Partial<Record<Field, string>>;

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const username = String(f.get("username") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");

    // quick client-side checks; the backend stays the source of truth
    const local: Errors = {};
    if (!username) local.username = t("errors.required");
    if (!email) local.email = t("errors.required");
    else if (!/^\S+@\S+\.\S+$/.test(email)) local.email = t("errors.emailInvalid");
    if (password.length < 8) local.password = t("errors.passwordShort");
    setErrors(local);
    setFormError(null);
    if (Object.keys(local).length) return;

    setLoading(true);
    const res = await registerAction({ username, email, password });

    if (!res.ok) {
      setErrors(res.fields ?? {});
      if (!res.fields || !Object.keys(res.fields).length) {
        setFormError(["NETWORK", "VALIDATION"].includes(res.code) ? res.code : "REQUEST_FAILED");
      }
      setLoading(false);
      return;
    }

    // account created → sign in right away so the session cookie is set
    const login = await signIn("credentials", { identifier: email.toLowerCase(), password, redirect: false });
    if (login?.ok) {
      router.replace("/");
      router.refresh();
      return;
    }
    router.replace("/login"); // account exists, but auto sign-in failed
  }

  return (
    <AuthCard title={t("register.title")} subtitle={t("register.subtitle")}>
      <GoogleButton />

      <div className="my-5 flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        {t("or")}
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthInput
          name="username"
          label={t("register.username")}
          placeholder={t("register.usernamePh")}
          autoComplete="username"
          error={errors.username}
        />
        <AuthInput
          name="email"
          type="email"
          label={t("register.email")}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <PasswordInput
          name="password"
          label={t("register.password")}
          hint={t("register.passwordHint")}
          autoComplete="new-password"
          error={errors.password}
        />

        {formError && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">
            {t(`errors.${formError}`)}
          </p>
        )}

        <SubmitButton loading={loading}>{t("register.submit")}</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t("register.haveAccount")}{" "}
        <Link href="/login" className="font-medium text-sky-600 hover:text-sky-500">
          {t("register.toLogin")}
        </Link>
      </p>
    </AuthCard>
  );
}

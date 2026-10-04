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

export function LoginForm({ callbackUrl, oauthError }: { callbackUrl: string; oauthError: boolean }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(oauthError ? "google" : null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      identifier: String(form.get("identifier") ?? ""),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });

    if (res?.ok) {
      router.replace(callbackUrl);
      router.refresh();
      return; // keep the spinner until the page changes
    }
    setError(res?.error && ["INVALID_CREDENTIALS", "NETWORK"].includes(res.error) ? res.error : "REQUEST_FAILED");
    setLoading(false);
  }

  return (
    <AuthCard title={t("login.title")} subtitle={t("login.subtitle")}>
      <GoogleButton callbackUrl={callbackUrl} />

      <div className="my-5 flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        {t("or")}
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <AuthInput
          name="identifier"
          label={t("login.identifier")}
          placeholder={t("login.identifierPh")}
          autoComplete="username"
          required
        />
        <PasswordInput name="password" label={t("login.password")} autoComplete="current-password" required />

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">
            {t(`errors.${error}`)}
          </p>
        )}

        <SubmitButton loading={loading}>{t("login.submit")}</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {t("login.noAccount")}{" "}
        <Link href="/register" className="font-medium text-sky-600 hover:text-sky-500">
          {t("login.toRegister")}
        </Link>
      </p>
    </AuthCard>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("title") };
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const callbackUrl = pick(sp.callbackUrl);
  return (
    <LoginForm
      // only same-site relative paths, to avoid open redirects
      callbackUrl={callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/"}
      oauthError={!!pick(sp.error)}
    />
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { headerConfig } from "@/config/header.config";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  // Already signed in → nothing to do here
  if (await getSession()) redirect("/");
  const t = await getTranslations("auth");

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-zinc-50">
      {/* grid + glow background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_55%_at_50%_40%,#000_30%,transparent_100%)]"
      />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-12%] h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-sky-400/25 blur-[110px]" />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500">
          <Logo />
          <span className="hidden text-sm font-semibold text-zinc-900 sm:inline">{headerConfig.brand.name}</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="hidden items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-900 sm:flex">
            <ArrowLeft className="size-3.5" />
            {t("back")}
          </Link>
          <LanguageSwitcher scrolled />
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4">{children}</main>
    </div>
  );
}

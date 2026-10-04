"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CloudShader } from "@/components/ui/cloud-shader";
import { Header } from "./header";

export function CloudShaderHero() {
  const t = useTranslations("hero");

  return (
    <div className="relative min-h-200 w-full overflow-hidden">
      <CloudShader className="absolute inset-0" />

      {/* navbar (fixed) + spacer so content doesn't jump under it */}
      <Header />
      <div className="h-12" aria-hidden />

      {/* hero */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pt-12 text-center md:pt-20">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-6xl lg:text-7xl">
          {t.rich("title", {
            br: () => <br className="hidden md:block" />,
          })}
        </h1>
        <p className="mt-6 max-w-2xl text-base text-white/90 drop-shadow-sm md:text-lg">
          {t("description")}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-sky-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            {t("startFree")}
          </Link>
          <a
            href="#"
            className="rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            {t("bookDemo")}
          </a>
        </div>
        <p className="mt-4 text-xs text-white/70">
          {t("note")}
        </p>
      </div>
    </div>
  );
}

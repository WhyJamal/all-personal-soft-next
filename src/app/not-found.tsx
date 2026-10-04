import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SolidPage } from "@/components/solid-page";
import { btnPrimary, btnSecondary } from "@/components/products/styles";

export default async function NotFound() {
  const t = await getTranslations("notfound");

  return (
    <SolidPage>
      <div className="relative grid min-h-[75dvh] place-items-center overflow-hidden px-4">
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 size-105 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/20 blur-[100px]" />
        <div className="relative text-center">
          <p className="bg-linear-to-b from-sky-500 to-indigo-600 bg-clip-text text-[clamp(6rem,22vw,11rem)] font-bold leading-none tracking-tighter text-transparent">
            404
          </p>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">{t("title")}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">{t("text")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className={btnPrimary}>
              {t("home")}
            </Link>
            <Link href="/products" className={btnSecondary}>
              {t("products")}
            </Link>
          </div>
        </div>
      </div>
    </SolidPage>
  );
}

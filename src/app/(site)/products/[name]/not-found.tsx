import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { btnPrimary } from "@/components/products/styles";

export default async function ProductNotFound() {
  const t = await getTranslations("products");
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-32 text-center">
      <p className="text-6xl font-semibold tracking-tight text-sky-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900">{t("notFound.title")}</h1>
      <p className="mt-3 text-zinc-600">{t("notFound.text")}</p>
      <Link href="/products" className={`${btnPrimary} mt-8`}>
        {t("detail.back")}
      </Link>
    </div>
  );
}

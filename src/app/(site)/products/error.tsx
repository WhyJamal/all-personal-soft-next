"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { btnPrimary } from "@/components/products/styles";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("products");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-32 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
        <RefreshCw className="size-6" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold text-zinc-900">{t("error.title")}</h1>
      <p className="mt-3 text-zinc-600">{t("error.text")}</p>
      <button type="button" onClick={reset} className={`${btnPrimary} mt-8`}>
        {t("error.retry")}
      </button>
    </div>
  );
}

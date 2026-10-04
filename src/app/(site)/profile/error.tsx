"use client";

import { useTranslations } from "next-intl";

export default function ProfileError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("profile.error");
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-32 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">{t("title")}</h1>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
      >
        {t("retry")}
      </button>
    </div>
  );
}

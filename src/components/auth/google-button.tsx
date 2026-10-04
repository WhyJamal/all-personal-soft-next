"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "./google-icon";

export function GoogleButton({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        signIn("google", { callbackUrl });
      }}
      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-800 transition-all hover:bg-zinc-50 active:translate-y-px disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-[18px]" />}
      {t("google")}
    </button>
  );
}

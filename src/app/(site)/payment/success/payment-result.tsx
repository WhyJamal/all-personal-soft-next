"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { Header } from "@/components/header";

export function PaymentResult({ ok }: { ok: boolean }) {
  const t = useTranslations("manage.payment");
  const router = useRouter();

  useEffect(() => {
    router.refresh();
    const timer = setTimeout(() => router.replace("/profile"), 3000);
    return () => clearTimeout(timer);
  }, [router]);

  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <>
      <Header solid />
      <main className="grid min-h-[70dvh] place-items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex max-w-sm flex-col items-center text-center"
        >
          <span className={`grid size-20 place-items-center rounded-full ${ok ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}>
            <Icon className="size-10" />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">{ok ? t("success") : t("failed")}</h1>
          <p className="mt-2 text-sm text-zinc-500">{ok ? t("successText") : t("failedText")}</p>
          <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-zinc-100">
            <motion.div className={`h-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 3, ease: "linear" }} />
          </div>
        </motion.div>
      </main>
    </>
  );
}

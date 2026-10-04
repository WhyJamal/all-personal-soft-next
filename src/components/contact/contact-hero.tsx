import { useTranslations } from "next-intl";
import { Phone, Send } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { contactConfig } from "@/config/contact.config";

export function ContactHero() {
  const t = useTranslations("contact");

  return (
    <section className="relative isolate overflow-hidden rounded-[28px] bg-zinc-950 px-6 py-14 sm:px-12 md:py-20">
      {/* dotted grid that fades out toward the edges */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(rgb(255_255_255/0.16)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <Spotlight className="-top-40 left-0 md:-top-24 md:left-40" fill="#38bdf8" />
      <div aria-hidden className="absolute -bottom-32 -right-24 -z-10 size-96 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative z-10 max-w-3xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-sky-300 backdrop-blur">
          <span className="size-1.5 rounded-full bg-sky-400" />
          {t("badge")}
        </span>

        <h1 className="mt-6 bg-linear-to-b from-white to-zinc-400 bg-clip-text text-4xl font-semibold tracking-tight text-balance text-transparent md:text-6xl">
          <TextGenerateEffect words={t("title")} />
        </h1>

        <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400 md:text-lg">{t("subtitle")}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={contactConfig.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgb(14_165_233/0.8)] transition-colors hover:bg-sky-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <Send className="size-4" />
            {t("quick.telegram")}
          </a>
          <a
            href={`tel:${contactConfig.phones[0].replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
          >
            <Phone className="size-4" />
            {t("quick.call")}
          </a>
        </div>
      </div>
    </section>
  );
}

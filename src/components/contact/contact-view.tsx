import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/reveal";
import { ContactChannels } from "./contact-channels";
import { ContactForm } from "./contact-form";
import { ContactHero } from "./contact-hero";
import { WorkHours } from "./work-hours";

export function ContactView() {
  const t = useTranslations("contact.channels");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 md:px-6 md:pt-8">
      <ContactHero />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Reveal>
          <ContactForm />
        </Reveal>

        <Reveal delay={0.1} className="space-y-6">
          <div>
            <h2 className="mb-3 px-1 text-sm font-semibold text-zinc-900">{t("title")}</h2>
            <ContactChannels />
          </div>
          <WorkHours />
        </Reveal>
      </div>
    </div>
  );
}

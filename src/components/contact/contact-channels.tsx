"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Mail, MapPin, Phone, Send } from "lucide-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { contactConfig } from "@/config/contact.config";
import { cn } from "@/lib/utils";

function CopyButton({ value }: { value: string }) {
  const t = useTranslations("contact.channels");
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      /* clipboard blocked — nothing to do */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={done ? t("copied") : t("copy")}
      title={done ? t("copied") : t("copy")}
      className={cn(
        "relative z-10 mr-3 grid size-9 shrink-0 place-items-center rounded-xl border transition-colors",
        done ? "border-emerald-200 bg-emerald-50 text-emerald-600" : "border-zinc-200 bg-white text-zinc-400 hover:text-sky-600"
      )}
    >
      {done ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

type ChannelProps = {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  copy?: string;
};

function Channel({ icon, label, value, href, external, copy }: ChannelProps) {
  return (
    <CardSpotlight className="rounded-2xl border border-zinc-200 bg-white transition-colors hover:border-sky-200">
      <div className="flex items-center">
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="flex min-w-0 flex-1 items-center gap-3.5 rounded-2xl p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600 transition-colors group-hover/spot:bg-sky-100">
            {icon}
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-medium text-zinc-400">{label}</span>
            <span className="block truncate text-sm font-semibold text-zinc-900">{value}</span>
          </span>
        </a>
        {copy && <CopyButton value={copy} />}
      </div>
    </CardSpotlight>
  );
}

export function ContactChannels() {
  const t = useTranslations("contact.channels");
  const phone = contactConfig.phones[0];

  return (
    <div className="space-y-3">
      <Channel
        icon={<Send className="size-5" />}
        label={t("telegram")}
        value={contactConfig.telegram.replace(/^https?:\/\//, "")}
        href={contactConfig.telegram}
        external
      />
      <Channel
        icon={<Phone className="size-5" />}
        label={t("phone")}
        value={phone}
        href={`tel:${phone.replace(/\s/g, "")}`}
        copy={phone}
      />
      <Channel
        icon={<Mail className="size-5" />}
        label={t("email")}
        value={contactConfig.email}
        href={`mailto:${contactConfig.email}`}
        copy={contactConfig.email}
      />
      <Channel
        icon={<MapPin className="size-5" />}
        label={t("address")}
        value={t("addressValue")}
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactConfig.mapsQuery)}`}
        external
      />
    </div>
  );
}

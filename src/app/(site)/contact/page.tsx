import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactView } from "@/components/contact/contact-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact.meta");
  return { title: t("title"), description: t("description") };
}

export default function ContactPage() {
  return <ContactView />;
}

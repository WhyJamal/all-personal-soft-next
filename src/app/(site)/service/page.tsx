import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ServiceView } from "@/components/service/service-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("service");
  return { title: t("title"), description: t("subtitle") };
}

export default function ServicePage() {
  return <ServiceView />;
}

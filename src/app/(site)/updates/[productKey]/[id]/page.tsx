import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { fetchProfile } from "@/lib/profile/server";
import { fetchVersions } from "@/lib/updates/server";
import { UpdatesView } from "@/components/updates/updates-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("manage.updates");
  return { title: t("title") };
}

export default async function UpdatesPage({ params }: PageProps<"/updates/[productKey]/[id]">) {
  const { productKey: rawKey, id } = await params;
  const productKey = decodeURIComponent(rawKey);
  const login = `/login?callbackUrl=${encodeURIComponent(`/updates/${rawKey}/${id}`)}`;

  const session = await getSession();
  if (!session?.accessToken || session.error) redirect(login);

  const me = await fetchProfile(session.accessToken);
  if (!me) redirect(login);

  // the base must belong to this user and to this product
  const base = me.products.find((p) => String(p.id) === id && p.productName === productKey);
  if (!base) notFound();

  const versions = await fetchVersions(productKey, session.accessToken);
  if (!versions) redirect(login);
  return <UpdatesView base={{ id: base.id, title: base.title, productName: base.productName, version: base.version }} versions={versions} />;
}

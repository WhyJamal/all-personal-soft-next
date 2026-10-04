import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { fetchProfile, serverNow } from "@/lib/profile/server";
import { ProfileView } from "@/components/profile/profile-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("profile");
  return { title: t("title") };
}

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.accessToken || session.error) redirect("/login?callbackUrl=/profile");

  const me = await fetchProfile(session.accessToken);
  if (!me) redirect("/login?callbackUrl=/profile");

  // `now` comes from the server so dates/progress render identically on the client
  return <ProfileView me={me} now={serverNow()} />;
}

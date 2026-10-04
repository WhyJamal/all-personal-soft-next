import "server-only";
import { env } from "@/lib/env";
import type { ProfileData } from "./types";

/** Backend may return relative or localhost media URLs — point them at the real API origin. */
export function fixMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, env.API_ORIGIN);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") {
      return new URL(u.pathname + u.search, env.API_ORIGIN).toString();
    }
    return u.toString();
  } catch {
    return null;
  }
}

type RawProduct = {
  id: number;
  product_id: number;
  order?: number;
  chosen?: boolean;
  title: string;
  product_name: string;
  product_url: string;
  subscription: { plan_name?: string; start_date: string; end_date: string } | null;
  version: { version: string } | null;
};

/** Request-time clock (kept out of components, which must stay pure). */
export const serverNow = () => Date.now();

/** null → token rejected (send the user to /login). Throws on other failures. */
export async function fetchProfile(accessToken: string): Promise<ProfileData | null> {
  const res = await fetch(`${env.API_BASE_URL}/users/me/`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(env.API_TIMEOUT_MS),
  });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error(`profile: backend responded ${res.status}`);

  const { user } = await res.json();
  const org = user.organization;

  return {
    userId: user.id,
    username: user.username ?? "",
    email: user.email ?? "",
    phone: user.phone_number ?? "",
    bio: user.bio ?? "",
    avatarUrl: fixMediaUrl(user.avatar_url),
    walletBalance: Number(user.wallet_balance) || 0,
    promoCode: org?.promo_code ?? null,
    org: org ? { id: org.id, name: org.name, inn: org.inn, address: org.address ?? null } : null,
    products: ((org?.products ?? []) as RawProduct[]).flatMap((p) =>
      p.subscription
        ? [
            {
              id: p.id,
              productId: p.product_id,
              order: p.order ?? 0,
              chosen: !!p.chosen,
              title: p.title,
              productName: p.product_name,
              url: p.product_url,
              plan: p.subscription.plan_name ?? null,
              version: p.version?.version ?? null,
              start: p.subscription.start_date,
              end: p.subscription.end_date,
            },
          ]
        : []
    ),
  };
}

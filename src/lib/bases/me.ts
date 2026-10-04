/** Lightweight view of `GET users/me/` used by the "create base" flow (client-safe). */
export type MyBase = {
  id: number;
  productId: number;
  title: string;
  url: string;
  plan: string | null;
  end: string;
};

export type MeLite = {
  walletBalance: number;
  org: { id: number; inn: string; name: string } | null;
  bases: MyBase[];
};

type RawMe = {
  user?: {
    wallet_balance?: string | number;
    organization?: {
      id: number;
      inn: string;
      name: string;
      products?: {
        id: number;
        product_id: number;
        title: string;
        product_url: string;
        subscription: { plan_name?: string; end_date: string } | null;
      }[];
    } | null;
  };
};

export function parseMe(raw: RawMe): MeLite {
  const u = raw.user;
  const org = u?.organization ?? null;
  return {
    walletBalance: Number(u?.wallet_balance) || 0,
    org: org ? { id: org.id, inn: org.inn, name: org.name } : null,
    bases: (org?.products ?? []).flatMap((p) =>
      p.subscription
        ? [{ id: p.id, productId: p.product_id, title: p.title, url: p.product_url, plan: p.subscription.plan_name ?? null, end: p.subscription.end_date }]
        : []
    ),
  };
}

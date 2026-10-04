import "server-only";
import { ApiError, apiFetch } from "@/lib/api/client";
import { getSession } from "@/lib/auth/session";

export type FeatureValue = boolean | string;
export type PlanFeatureRow = { category: string; name: string; values: [FeatureValue, FeatureValue, FeatureValue] };

type Raw = { category?: string; name?: string; starter?: FeatureValue; growth?: FeatureValue; scale?: FeatureValue };

function normalize(data: unknown): PlanFeatureRow[] {
  const list: Raw[] = Array.isArray(data) ? data : ((data as { results?: Raw[] } | null)?.results ?? []);
  return list
    .filter((r) => r.name)
    .map((r) => ({
      category: r.category ?? "",
      name: r.name ?? "",
      values: [r.starter ?? false, r.growth ?? false, r.scale ?? false],
    }));
}

/**
 * Feature matrix for the comparison table. The endpoint may require a login,
 * so: try anonymously (cached), and only then retry with the visitor's token.
 * Returns [] when it can't be loaded — the page just hides the table.
 */
export async function getPlanFeatures(): Promise<PlanFeatureRow[]> {
  try {
    return normalize(await apiFetch<unknown>("/plans/plan-features/", { revalidate: 300 }));
  } catch (e) {
    if (!(e instanceof ApiError) || (e.status !== 401 && e.status !== 403)) return [];
  }
  try {
    const session = await getSession();
    if (!session?.accessToken || session.error) return [];
    return normalize(
      await apiFetch<unknown>("/plans/plan-features/", {
        revalidate: 0,
        init: { headers: { Authorization: `Bearer ${session.accessToken}` } },
      })
    );
  } catch {
    return [];
  }
}

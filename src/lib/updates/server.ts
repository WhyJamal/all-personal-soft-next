import "server-only";
import { env } from "@/lib/env";
import { resolveMediaUrl } from "@/lib/media";

export type VersionMedia = { id: number; type: "image" | "video" | "file"; url: string };
export type ProductVersion = { id: number; version: string; description: string; createdAt: string; media: VersionMedia[] };

type RawVersion = {
  id: number;
  version: string;
  description?: string;
  created_at: string;
  media?: { id: number; media: string; media_type: string }[];
};

/** Versions of a product, newest first as the backend returns them. Needs the user's token; null = token rejected. */
export async function fetchVersions(productKey: string, accessToken: string): Promise<ProductVersion[] | null> {
  const res = await fetch(`${env.API_BASE_URL}/products/versions/?product=${encodeURIComponent(productKey)}`, {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(env.API_TIMEOUT_MS),
  });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error(`versions: backend responded ${res.status}`);
  const data = await res.json();
  const list: RawVersion[] = Array.isArray(data) ? data : (data.results ?? []);

  return list.map((v) => ({
    id: v.id,
    version: v.version,
    description: v.description ?? "",
    createdAt: v.created_at,
    media: (v.media ?? []).flatMap((m) => {
      const url = resolveMediaUrl(m.media, env.API_ORIGIN);
      const type = m.media_type === "image" || m.media_type === "video" ? m.media_type : "file";
      return url ? [{ id: m.id, type, url }] : [];
    }),
  }));
}

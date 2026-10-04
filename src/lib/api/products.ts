import "server-only";
import { cache } from "react";
import { env } from "@/lib/env";
import { resolveMediaUrl, safeHttpUrl, youtubeId } from "@/lib/media";
import { apiFetch } from "./client";
import type { ApiPlan, ApiProduct, Plan, Product } from "./types";

export const PRODUCTS_TAG = "products";

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const DEFAULT_GRADIENT: Product["gradient"] = ["#E0F2FE", "#F0F9FF", "#EEF2FF"];

function toNumber(value: string | number | null | undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** "#DCFCE7, #F0FDF4, #FEFCE8" -> three validated colors (never raw backend CSS) */
function parseGradient(input: string | null | undefined): Product["gradient"] {
  const colors = (input ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter((c) => HEX.test(c));
  if (colors.length === 0) return DEFAULT_GRADIENT;
  return [colors[0], colors[1] ?? colors[0], colors[2] ?? colors[1] ?? colors[0]];
}

function normalizePlan(p: ApiPlan): Plan {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description ?? "",
    price: toNumber(p.price),
    durationDays: p.duration_days || 30,
    features: p.features ?? [],
    highlight: Boolean(p.highlight),
    isDefault: Boolean(p.is_default),
  };
}

function normalizeProduct(raw: ApiProduct): Product {
  const plans = (raw.plans ?? [])
    .filter((p) => p.is_active)
    .map(normalizePlan)
    .sort((a, b) => a.price - b.price);

  const hero = raw.hero_section;
  const features = raw.features_section;
  const modules = raw.modules_section;

  return {
    id: raw.id,
    slug: raw.name,
    title: raw.title,
    description: raw.description ?? "",
    badge: raw.badge || null,
    tags: raw.tags ?? [],
    isActive: Boolean(raw.is_active),
    icon: resolveMediaUrl(raw.icon, env.API_ORIGIN),
    image: resolveMediaUrl(raw.hero_section_image_url ?? raw.hero_section_image, env.API_ORIGIN),
    gradient: parseGradient(hero?.gradient),
    plans,
    startingPrice: plans.length ? Math.min(...plans.map((p) => p.price)) : null,
    demoUrl: safeHttpUrl(raw.demo_url),
    includedUsers: raw.included_users ?? 0,
    extraUserPrice: toNumber(raw.extra_user_price),
    hero: {
      title: hero?.title || raw.title,
      description: hero?.description || raw.description || "",
    },
    features: {
      title: features?.title ?? "",
      bullets: features?.bullets ?? [],
      videoId: youtubeId(raw.features_section_videoID, features?.videoId),
    },
    modules: { title: modules?.title ?? "", items: modules?.tabs ?? [] },
    updatedAt: raw.updated_at,
  };
}

/** The API returns a plain array today; also accept a DRF-style { results: [] } page. */
function extractList(data: unknown): ApiProduct[] {
  if (Array.isArray(data)) return data as ApiProduct[];
  const results = (data as { results?: unknown } | null)?.results;
  return Array.isArray(results) ? (results as ApiProduct[]) : [];
}

/** Throws ApiError when the backend is unreachable — caught by app/products/error.tsx */
export const getProducts = cache(async (): Promise<Product[]> => {
  const data = await apiFetch<unknown>("/products/", { tags: [PRODUCTS_TAG] });
  return extractList(data)
    .map(normalizeProduct)
    .sort((a, b) => Number(b.isActive) - Number(a.isActive) || a.id - b.id);
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  let wanted = slug;
  try {
    wanted = decodeURIComponent(slug);
  } catch {
    /* keep raw */
  }
  wanted = wanted.toLowerCase();
  const products = await getProducts();
  return products.find((p) => p.slug.toLowerCase() === wanted) ?? null;
});

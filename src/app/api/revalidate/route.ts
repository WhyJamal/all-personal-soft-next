import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { PRODUCTS_TAG } from "@/lib/api/products";

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Optional webhook: the backend calls this after a product changes so the site
 * refreshes immediately instead of waiting for API_REVALIDATE_SECONDS.
 *   curl -X POST https://<site>/api/revalidate -H "x-revalidate-secret: $REVALIDATE_SECRET"
 */
export async function POST(request: NextRequest) {
  if (!env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Revalidation is disabled" }, { status: 404 });
  }
  const provided = request.headers.get("x-revalidate-secret") ?? "";
  if (!safeEqual(provided, env.REVALIDATE_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  revalidateTag(PRODUCTS_TAG, "max");
  return NextResponse.json({ revalidated: true, tag: PRODUCTS_TAG });
}

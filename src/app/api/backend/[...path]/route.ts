import { NextResponse, type NextRequest } from "next/server";
import { getLocale } from "next-intl/server";
import { env } from "@/lib/env";
import { getSession } from "@/lib/auth/session";

/**
 * Authenticated proxy to the Django API.
 * The browser calls `/api/backend/<path>`; the access token stays on the server,
 * so there is no CORS and no token in JS-readable storage.
 */

// Only these backend areas are reachable through the proxy.
const ALLOWED = [
  "organizations/",
  "payments/click/",
  "products/reviews/",
  "products/versions/",
  "plans/",
  "contact/",
  "users/me/",
];
// Reachable without signing in (read-only, plus the contact form)
const PUBLIC = (method: string, path: string) =>
  (method === "GET" && /^(plans\/|products\/reviews\/|organizations\/invite\/)/.test(path)) ||
  (method === "POST" && path === "contact/");

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, { params }: Ctx) {
  const { path: segments } = await params;
  if (segments.some((s) => s === ".." || s === "." || s.includes("\\"))) {
    return NextResponse.json({ detail: "Bad path" }, { status: 400 });
  }
  const path = segments.join("/").replace(/\/+$/, "") + "/"; // Django wants the trailing slash
  const method = req.method;

  if (!ALLOWED.some((p) => path.startsWith(p))) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const session = await getSession();
  const token = session && !session.error ? session.accessToken : undefined;
  if (!token && !PUBLIC(method, path)) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": await getLocale(),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const type = req.headers.get("content-type") ?? "";
    if (type.startsWith("multipart/form-data")) {
      body = await req.formData(); // fetch sets the boundary itself
    } else {
      body = await req.text();
      if (type) headers["Content-Type"] = type;
    }
  }

  let res: Response;
  try {
    res = await fetch(`${env.API_BASE_URL}/${path}${req.nextUrl.search}`, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(Math.max(env.API_TIMEOUT_MS, 20000)),
    });
  } catch {
    return NextResponse.json({ detail: "Backend unreachable", code: "NETWORK" }, { status: 502 });
  }

  const text = await res.text();
  return new NextResponse(text || null, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };

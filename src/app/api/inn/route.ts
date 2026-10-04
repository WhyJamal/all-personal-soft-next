import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { getSession } from "@/lib/auth/session";

/** GET /api/inn?inn=123456789 → { found, name, inn, address } (keeps the lookup token on the server) */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ found: false }, { status: 401 });

  const inn = req.nextUrl.searchParams.get("inn")?.replace(/\D/g, "") ?? "";
  if ((inn.length !== 9 && inn.length !== 12) || !env.ORG_FOUND_API_URL) {
    return NextResponse.json({ found: false });
  }

  try {
    const res = await fetch(`${env.ORG_FOUND_API_URL}/${inn}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${env.ORG_FOUND_API_TOKEN}` },
      cache: "no-store",
      signal: AbortSignal.timeout(env.API_TIMEOUT_MS),
    });
    const data = res.ok ? await res.json() : null;
    if (!data?.name) return NextResponse.json({ found: false });
    return NextResponse.json({ found: true, name: data.name, inn: data.tin ?? inn, address: data.address ?? "" });
  } catch {
    return NextResponse.json({ found: false });
  }
}

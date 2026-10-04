import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getSession } from "@/lib/auth/session";
import { fixMediaUrl } from "@/lib/profile/server";

const MAX_AVATAR = 5 * 1024 * 1024;
const fail = (code: string, status: number, extra?: object) =>
  NextResponse.json({ ok: false, code, ...extra }, { status });

/** Thin proxy to Django `PATCH /users/me/` (multipart, so avatars work and tokens stay server-side). */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.accessToken || session.error) return fail("UNAUTHORIZED", 401);

  const body = await req.formData().catch(() => null);
  if (!body) return fail("REQUEST_FAILED", 400);

  const avatar = body.get("avatar");
  if (avatar instanceof File && (!avatar.type.startsWith("image/") || avatar.size > MAX_AVATAR)) {
    return fail("AVATAR_INVALID", 400);
  }

  let res: Response;
  try {
    res = await fetch(`${env.API_BASE_URL}/users/me/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${session.accessToken}`, Accept: "application/json" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(Math.max(env.API_TIMEOUT_MS, 20000)),
    });
  } catch {
    return fail("NETWORK", 502);
  }

  const data = await res.json().catch(() => null);
  if (res.status === 401) return fail("UNAUTHORIZED", 401);
  if (!res.ok || !data) {
    const fields = res.status === 400 && data && typeof data === "object" ? data : undefined;
    return fail(fields ? "VALIDATION" : "REQUEST_FAILED", res.status === 400 ? 400 : 502, { fields });
  }

  return NextResponse.json({
    ok: true,
    user: { username: data.username, email: data.email, avatarUrl: fixMediaUrl(data.avatar_url) },
  });
}

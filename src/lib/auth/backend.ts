import "server-only";
import { getLocale } from "next-intl/server";
import { env } from "@/lib/env";

export type BackendUser = {
  id: number;
  username: string;
  email: string;
  phone_number?: string;
  bio?: string;
  avatar_url?: string | null;
};

export type BackendAuth = { user: BackendUser; access: string; refresh: string };

/** code: INVALID_CREDENTIALS | NETWORK | REQUEST_FAILED. fields: DRF validation errors */
export class AuthError extends Error {
  constructor(
    public readonly code: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(code);
    this.name = "AuthError";
  }
}

async function post<T>(path: string, body: unknown, badRequestCode = "REQUEST_FAILED"): Promise<T> {
  const locale = await getLocale();
  let res: Response;
  try {
    res = await fetch(`${env.API_BASE_URL}/users${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": locale },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(env.API_TIMEOUT_MS),
    });
  } catch {
    throw new AuthError("NETWORK");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const fields =
      data && typeof data === "object" && res.status === 400 && !("detail" in data)
        ? (data as Record<string, string[]>)
        : undefined;
    throw new AuthError(res.status === 400 ? badRequestCode : "REQUEST_FAILED", fields);
  }
  return data as T;
}

export const loginRequest = (identifier: string, password: string) =>
  post<BackendAuth>("/auth/login/", { identifier, password }, "INVALID_CREDENTIALS");

export const registerRequest = (input: { username: string; email: string; password: string }) =>
  post<BackendAuth>("/auth/register/", input, "VALIDATION");

export const googleRequest = (token: string) => post<BackendAuth>("/auth/google/", { token });

export const refreshRequest = (refresh: string) =>
  post<{ access: string; refresh?: string }>("/auth/token/refresh/", { refresh });

/** JWT exp (ms). 0 if unreadable. */
export function tokenExpiry(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return Number(payload.exp) * 1000 || 0;
  } catch {
    return 0;
  }
}

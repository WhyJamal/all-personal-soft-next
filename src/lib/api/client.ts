import "server-only";
import { getLocale } from "next-intl/server";
import { env } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly url: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiFetchOptions = {
  /** Seconds to cache the response. `false` = until revalidated, `0` = never. */
  revalidate?: number | false;
  /** Cache tags, so the data can be refreshed with revalidateTag() */
  tags?: string[];
  init?: RequestInit;
};

/**
 * Single entry point for talking to the backend from the server
 * (Server Components, Server Actions, Route Handlers).
 * Reads are cached by Next.js; add POST helpers next to it when the backend needs them.
 */
export async function apiFetch<T>(
  path: string,
  { revalidate = env.API_REVALIDATE_SECONDS, tags, init }: ApiFetchOptions = {}
): Promise<T> {
  const url = `${env.API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const locale = await getLocale();

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "Accept-Language": locale,
        ...init?.headers,
      },
      signal: init?.signal ?? AbortSignal.timeout(env.API_TIMEOUT_MS),
      next: { revalidate, tags },
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    throw new ApiError(0, `Request to ${url} failed: ${reason}`, url);
  }

  if (!res.ok) {
    throw new ApiError(res.status, `Request to ${url} returned ${res.status}`, url);
  }

  return (await res.json()) as T;
}

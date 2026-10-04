/** Browser-side client for the `/api/backend/*` proxy (see app/api/backend/[...path]/route.ts). */

export class BffError extends Error {
  constructor(
    public readonly status: number,
    public readonly data: unknown
  ) {
    super(`Request failed with ${status}`);
    this.name = "BffError";
  }
}

type Options = {
  /** Don't sign the visitor out on 401 (for reads that may legitimately be anonymous). */
  keepSession?: boolean;
};

async function request<T>(method: string, path: string, body?: unknown, options?: Options): Promise<T> {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const [route, query] = path.split("?");
  const res = await fetch(`/api/backend/${route.replace(/^\/+|\/+$/g, "")}${query ? `?${query}` : ""}`, {
    method,
    headers: body === undefined || isForm ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && !options?.keepSession) {
      const { signOut } = await import("next-auth/react");
      void signOut({ callbackUrl: "/login" });
    }
    throw new BffError(res.status, data);
  }
  return data as T;
}

export const bff = {
  get: <T>(path: string, options?: Options) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};

/** Best human-readable message from a backend error. */
export function errorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof BffError)) return fallback;
  const d = error.data;
  if (typeof d === "string") return d;
  if (d && typeof d === "object") {
    const o = d as Record<string, unknown>;
    for (const key of ["detail", "error", "message"]) if (typeof o[key] === "string") return o[key] as string;
    for (const v of Object.values(o)) {
      if (Array.isArray(v) && typeof v[0] === "string") return v[0];
      if (typeof v === "string") return v;
    }
  }
  return fallback;
}

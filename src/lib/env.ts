import "server-only";

function toInt(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function parseBase(value: string | undefined) {
  const raw = (value?.trim() || "https://apsoft.uz/api").replace(/\/+$/, "");
  try {
    return { base: raw, origin: new URL(raw).origin };
  } catch {
    throw new Error(`API_BASE_URL is not a valid URL: "${raw}"`);
  }
}

const { base, origin } = parseBase(process.env.API_BASE_URL);

/** Server-only, validated configuration. Import from server code only. */
export const env = {
  API_BASE_URL: base,
  /** Origin of the backend, used to fix relative / localhost media URLs */
  API_ORIGIN: origin,
  API_REVALIDATE_SECONDS: toInt(process.env.API_REVALIDATE_SECONDS, 300),
  API_TIMEOUT_MS: toInt(process.env.API_TIMEOUT_MS, 8000),
  REVALIDATE_SECRET: process.env.REVALIDATE_SECRET ?? "",
  /** Optional: service that looks up a company by INN (fills the "create organization" form) */
  ORG_FOUND_API_URL: (process.env.ORG_FOUND_API_URL ?? "").replace(/\/+$/, ""),
  ORG_FOUND_API_TOKEN: process.env.ORG_FOUND_API_TOKEN ?? "",
} as const;

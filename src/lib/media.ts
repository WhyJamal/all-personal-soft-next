const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "0.0.0.0"]);

/**
 * Backend sometimes returns dev URLs (http://127.0.0.1:8000/...) or relative paths.
 * Point them at the real API origin and drop anything that isn't http(s).
 */
export function resolveMediaUrl(url: string | null | undefined, origin: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (LOCAL_HOSTS.has(u.hostname)) {
      const o = new URL(origin);
      u.protocol = o.protocol;
      u.host = o.host;
    }
    return u.toString();
  } catch {
    return null;
  }
}

/** Only http(s) links may reach an href. */
export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

const YT_ID = /^[\w-]{11}$/;

/** Accepts a bare id or a youtu.be / youtube.com URL. Returns null for anything else. */
export function youtubeId(...candidates: (string | null | undefined)[]): string | null {
  for (const raw of candidates) {
    const value = raw?.trim();
    if (!value) continue;
    if (YT_ID.test(value)) return value;
    try {
      const u = new URL(value);
      const host = u.hostname.replace(/^www\./, "");
      let id: string | null = null;
      if (host === "youtu.be") id = u.pathname.slice(1);
      else if (host.endsWith("youtube.com")) {
        id = u.searchParams.get("v") ?? u.pathname.match(/\/(?:embed|shorts)\/([\w-]+)/)?.[1] ?? null;
      }
      if (id && YT_ID.test(id)) return id;
    } catch {
      /* not a URL */
    }
  }
  return null;
}

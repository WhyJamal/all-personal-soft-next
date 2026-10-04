const DAY = 86_400_000;

export type Status = "active" | "expiring" | "expired";

export const INTL_LOCALE: Record<string, string> = { ru: "ru-RU", uz: "uz-UZ", en: "en-US" };

export function statusOf(end: string, now: number): Status {
  const left = new Date(end).getTime() - now;
  if (left <= 0) return "expired";
  return left <= 14 * DAY ? "expiring" : "active";
}

export const daysLeft = (end: string, now: number) =>
  Math.max(0, Math.ceil((new Date(end).getTime() - now) / DAY));

export function progressOf(start: string, end: string, now: number) {
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (b <= a) return 1;
  return Math.min(1, Math.max(0, (now - a) / (b - a)));
}

export const formatDate = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(INTL_LOCALE[locale] ?? locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso)
  );

export const formatMoney = (n: number, locale: string) =>
  new Intl.NumberFormat(INTL_LOCALE[locale] ?? locale, { maximumFractionDigits: 0 }).format(n);

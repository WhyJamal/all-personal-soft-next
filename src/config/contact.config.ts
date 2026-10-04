import { footerConfig } from "@/config/footer.config";

/** One work-hours row. `days` use JS numbering: 0 = Sunday … 6 = Saturday. */
export type WorkHours = { id: "weekdays" | "saturday"; days: number[]; from: string; to: string };

export const contactConfig = {
  email: "apsoft@inbox.ru",
  phones: ["+998 90 166 25 46"],
  /** Reuses the Telegram link from footer.config.ts — change it there. */
  telegram: footerConfig.socials.find((s) => s.id === "telegram")?.href ?? "https://t.me/",
  /** Opens in Google Maps. The visible address text lives in messages/<locale>/contact.json */
  mapsQuery: "Фергана, Узбекистан",

  /** Work hours are evaluated in this time zone, whatever the visitor's device says */
  timezone: "Asia/Tashkent",
  hours: [
    { id: "weekdays", days: [1, 2, 3, 4, 5], from: "09:00", to: "18:00" },
    { id: "saturday", days: [6], from: "10:00", to: "14:00" },
  ] satisfies WorkHours[],

  limits: { name: 80, subject: 120, messageMin: 10, messageMax: 2000 },
} as const;

import { footerConfig } from "@/config/footer.config";

export const siteConfig = {
  name: "Altitude",
  /** Where "Contact us" / "Choose plan" buttons point until an order flow exists.
   *  Reuses the Telegram link from footer.config.ts — change it there. */
  contactHref: footerConfig.socials.find((s) => s.id === "telegram")?.href ?? "#",
  products: {
    /** false: products with is_active=false are shown as "Soon" and are not clickable */
    linkInactive: false,
  },
} as const;

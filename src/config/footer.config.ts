export type SocialId = "telegram" | "instagram" | "x" | "linkedin" | "github";

export type FooterLink = {
  /** Key inside `sitefooter.links`, e.g. "products" */
  labelKey: string;
  href: string;
};

export type FooterSocial = {
  id: SocialId;
  /** Brand name shown as the link text (not translated) */
  label: string;
  href: string;
};

export type FooterConfig = {
  pages: FooterLink[];
  legal: FooterLink[];
  socials: FooterSocial[];
};

export const footerConfig = {
  pages: [
    { labelKey: "products", href: "/products" },
    { labelKey: "features", href: "/#features" },
    { labelKey: "contact", href: "/contact" },
    { labelKey: "docs", href: "#" },
    { labelKey: "blog", href: "#" },
  ],

  legal: [
    { labelKey: "privacy", href: "#" },
    { labelKey: "terms", href: "#" },
  ],

  // Remove or add items freely — supported ids: telegram, instagram, x, linkedin, github
  socials: [
    { id: "telegram", label: "Telegram", href: "https://t.me/" },
    { id: "instagram", label: "Instagram", href: "https://instagram.com/" },
    { id: "x", label: "X", href: "https://x.com/" },
    { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/" },
  ],
} satisfies FooterConfig;

export const currentYear = () => new Date().getFullYear();

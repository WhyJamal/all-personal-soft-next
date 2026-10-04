export type HeaderLink = {
  /** Key inside the `header` messages namespace (or `nav` when ns is "nav"), e.g. "features" */
  labelKey: string;
  href: string;
  /** Which messages namespace holds the label. Default: "header" */
  ns?: "header" | "nav";
};

export type HeaderConfig = {
  brand: { name: string; mark: string; href: string };
  /** Center navigation (visible from md and up) */
  links: HeaderLink[];
  /** Right side: secondary text link (visible from lg) and primary button */
  actions: { signIn: HeaderLink; getStarted: HeaderLink };
  /** Pixels scrolled before the navbar turns white */
  scrollThreshold: number;
};

export const headerConfig = {
  brand: { name: "All personal soft", mark: "A", href: "/" },

  links: [
    { labelKey: "products", href: "/products" },
    { labelKey: "plans", href: "/plans", ns: "nav" },
    { labelKey: "service", href: "/service", ns: "nav" },
    { labelKey: "contact", href: "/contact", ns: "nav" },
    // { labelKey: "features", href: "/#features" },
    // { labelKey: "docs", href: "#" },
    // { labelKey: "blog", href: "#" },
  ],

  actions: {
    signIn: { labelKey: "signIn", href: "/login" },
    getStarted: { labelKey: "getStarted", href: "/register" },
  },

  scrollThreshold: 10,
} satisfies HeaderConfig;

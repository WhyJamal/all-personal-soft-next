/** Shapes returned by the backend (snake_case, nullable fields). */
export type ApiPlan = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  price: string;
  period: string;
  duration_days: number;
  features: string[] | null;
  is_default: boolean;
  is_active: boolean;
  highlight: boolean;
  product: number;
};

export type ApiProduct = {
  id: number;
  name: string;
  title: string;
  description: string | null;
  is_active: boolean;
  badge: string | null;
  tags: string[] | null;
  icon: string | null;
  hero_section_image_url: string | null;
  hero_section_image: string | null;
  hero_section: { title?: string; description?: string; gradient?: string } | null;
  features_section: { title?: string; bullets?: string[]; videoId?: string | null } | null;
  features_section_videoID: string | null;
  modules_section: { title?: string; tabs?: { id: string; label: string }[] } | null;
  plans: ApiPlan[] | null;
  demo_url: string | null;
  included_users: number | null;
  extra_user_price: string | null;
  created_at: string;
  updated_at: string;
};

/** Shapes the UI works with. Components never touch the raw API types. */
export type Plan = {
  id: number;
  code: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  highlight: boolean;
  isDefault: boolean;
};

export type Product = {
  id: number;
  /** URL segment, e.g. "standart-1c" */
  slug: string;
  title: string;
  description: string;
  badge: string | null;
  tags: string[];
  isActive: boolean;
  icon: string | null;
  image: string | null;
  /** Three validated CSS colors */
  gradient: [string, string, string];
  plans: Plan[];
  startingPrice: number | null;
  demoUrl: string | null;
  includedUsers: number;
  extraUserPrice: number;
  hero: { title: string; description: string };
  features: { title: string; bullets: string[]; videoId: string | null };
  modules: { title: string; items: { id: string; label: string }[] };
  updatedAt: string;
};

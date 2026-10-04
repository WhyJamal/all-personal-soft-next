export type ProfileProduct = {
  /** OrganizationProduct id (the "base") */
  id: number;
  productId: number;
  order: number;
  chosen: boolean;
  title: string;
  productName: string;
  url: string;
  plan: string | null;
  version: string | null;
  start: string;
  end: string;
};

export type ProfileData = {
  /** Backend user id */
  userId: number;
  username: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string | null;
  walletBalance: number;
  promoCode: string | null;
  org: { id: number; name: string; inn: string; address: string | null } | null;
  products: ProfileProduct[];
};

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    access: string;
    refresh: string;
  }
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
    accessToken?: string;
    error?: "RefreshFailed";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access: string;
    refresh: string;
    accessExp: number;
    error?: "RefreshFailed";
  }
}

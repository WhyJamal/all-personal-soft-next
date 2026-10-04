import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import {
  AuthError,
  googleRequest,
  loginRequest,
  refreshRequest,
  tokenExpiry,
  type BackendAuth,
} from "./backend";

function applyAuth(token: JWT, a: BackendAuth): JWT {
  return {
    ...token,
    sub: String(a.user.id),
    name: a.user.username,
    email: a.user.email,
    picture: a.user.avatar_url ?? null,
    access: a.access,
    refresh: a.refresh,
    accessExp: tokenExpiry(a.access),
    error: undefined,
  };
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      credentials: { identifier: {}, password: {} },
      async authorize(credentials) {
        const identifier = credentials?.identifier?.trim();
        const password = credentials?.password;
        if (!identifier || !password) throw new Error("INVALID_CREDENTIALS");
        try {
          const a = await loginRequest(identifier, password);
          return {
            id: String(a.user.id),
            name: a.user.username,
            email: a.user.email,
            image: a.user.avatar_url ?? null,
            access: a.access,
            refresh: a.refresh,
          };
        } catch (e) {
          throw new Error(e instanceof AuthError ? e.code : "REQUEST_FAILED");
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Google: trade Google's id_token for our backend's JWT pair
      if (account?.provider === "google" && account.id_token) {
        return applyAuth(token, await googleRequest(account.id_token));
      }
      // Credentials: authorize() already returned the backend tokens
      if (user && "access" in user) {
        return {
          ...token,
          access: user.access,
          refresh: user.refresh,
          accessExp: tokenExpiry(user.access),
          error: undefined,
        };
      }
      // useSession().update({ name, email, image }) after a profile edit
      if (trigger === "update" && session) {
        const s = session as { name?: string; email?: string; image?: string | null };
        token = {
          ...token,
          name: s.name ?? token.name,
          email: s.email ?? token.email,
          picture: s.image === undefined ? token.picture : s.image,
        };
      }
      // Later requests: refresh the access token shortly before it expires
      if (token.access && Date.now() < token.accessExp - 60_000) return token;
      if (!token.refresh) return token;
      try {
        const r = await refreshRequest(token.refresh);
        return {
          ...token,
          access: r.access,
          refresh: r.refresh ?? token.refresh,
          accessExp: tokenExpiry(r.access),
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshFailed" };
      }
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub ?? "",
        name: token.name,
        email: token.email,
        image: token.picture,
      };
      session.accessToken = token.access;
      session.error = token.error;
      return session;
    },
  },
};

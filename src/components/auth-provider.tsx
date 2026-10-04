"use client";

import { useEffect } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";

/** If the backend refresh token is no longer valid, end the session instead of keeping a dead one. */
function SessionGuard() {
  const { data } = useSession();
  useEffect(() => {
    if (data?.error === "RefreshFailed") signOut({ callbackUrl: "/login" });
  }, [data?.error]);
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <SessionGuard />
      {children}
    </SessionProvider>
  );
}

"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

const HIDDEN_ON = ["/login", "/register"];

/** Shows the footer everywhere except the auth pages. */
export function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <>{children}</>;
}

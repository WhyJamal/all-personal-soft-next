import type { ReactNode } from "react";
import { Header } from "@/components/header";

/** Page shell with the always-white navbar, for pages without a dark hero. */
export function SolidPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <Header solid />
      <div className="h-12" aria-hidden />
      <main className="flex-1">{children}</main>
    </div>
  );
}

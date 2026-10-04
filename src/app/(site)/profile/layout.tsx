import type { ReactNode } from "react";
import { Header } from "@/components/header";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50/60">
      <Header solid />
      <div className="h-12" aria-hidden />
      <main className="flex-1">{children}</main>
    </div>
  );
}

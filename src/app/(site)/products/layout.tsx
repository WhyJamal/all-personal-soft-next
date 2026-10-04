import type { ReactNode } from "react";
import { Header } from "@/components/header";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Always-solid navbar: these pages have light backgrounds */}
      <Header solid />
      <div className="h-12" aria-hidden />
      <main className="flex-1">{children}</main>
    </div>
  );
}

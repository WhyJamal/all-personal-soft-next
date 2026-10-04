import type { ReactNode } from "react";
import { SolidPage } from "@/components/solid-page";

export default function Layout({ children }: { children: ReactNode }) {
  return <SolidPage>{children}</SolidPage>;
}

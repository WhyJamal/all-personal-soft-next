"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { footerLinkClass } from "./footer-link-class";

/** Sign up / Log in for guests, Profile for signed-in users. */
export function FooterAccount() {
  const { status } = useSession();
  const t = useTranslations("sitefooter.links");
  const items =
    status === "authenticated"
      ? [{ href: "/profile", key: "profile" }]
      : [
          { href: "/register", key: "signUp" },
          { href: "/login", key: "login" },
        ];

  return (
    // invisible while the session loads: keeps the layout, avoids a flash of the wrong links
    <ul className={cn("space-y-4", status === "loading" && "invisible")}>
      {items.map((i) => (
        <li key={i.key}>
          <Link href={i.href} className={footerLinkClass}>
            {t(i.key)}
          </Link>
        </li>
      ))}
    </ul>
  );
}

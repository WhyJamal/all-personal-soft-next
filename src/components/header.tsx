"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { headerConfig } from "@/config/header.config";
import { HeaderAuth } from "./header-auth";
import { MobileMenu } from "./header-mobile";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";

const { brand, links, scrollThreshold } = headerConfig;

function subscribe(callback: () => void) {
    window.addEventListener("scroll", callback, { passive: true });
    return () => window.removeEventListener("scroll", callback);
}

function useScrolled() {
    return useSyncExternalStore(
        subscribe,
        () => window.scrollY > scrollThreshold,
        () => false
    );
}

type HeaderProps = {
    /** Always use the white navbar (for pages without a dark hero behind it) */
    solid?: boolean;
};

export function Header({ solid = false }: HeaderProps) {
    const scrolledOnPage = useScrolled();
    const [open, setOpen] = useState(false);
    const close = useCallback(() => setOpen(false), []);
    // an open mobile menu always needs the white bar behind it
    const scrolled = solid || scrolledOnPage || open;

    const t = useTranslations("header");
    const tn = useTranslations("nav");
    const items = links.map((l) => ({
        href: l.href,
        label: "ns" in l && l.ns === "nav" ? tn(l.labelKey) : t(l.labelKey),
    }));

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "border-b border-black/5 bg-white/80 shadow-sm backdrop-blur-lg"
                    : "border-b border-transparent bg-transparent"
            )}
        >
            <nav className="mx-auto flex h-12 w-full max-w-7xl items-center justify-between px-4 md:grid md:grid-cols-[1fr_auto_1fr] md:px-6">
                <Link href={brand.href} onClick={close} className="flex items-center gap-1.5 justify-self-start">
                    <Logo />
                    <span
                        className={cn(
                            "text-[15px] font-semibold tracking-tight transition-colors duration-300",
                            scrolled ? "text-blue-700" : "text-white drop-shadow-sm"
                        )}
                    >
                        {brand.name}
                    </span>
                </Link>

                <div
                    className={cn(
                        "hidden items-center gap-5 whitespace-nowrap text-xs font-medium transition-colors duration-300 md:flex lg:gap-6",
                        scrolled ? "text-zinc-600" : "text-white/90"
                    )}
                >
                    {items.map((item) => (
                        <Link
                            key={item.href + item.label}
                            href={item.href}
                            className={cn("transition-colors", scrolled ? "hover:text-zinc-900" : "hover:text-white")}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-2 justify-self-end whitespace-nowrap">
                    <div className="hidden md:block">
                        <LanguageSwitcher scrolled={scrolled} />
                    </div>
                    <HeaderAuth scrolled={scrolled} />

                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        aria-label={open ? tn("close") : tn("menu")}
                        className={cn(
                            "relative grid size-9 place-items-center rounded-full transition-colors md:hidden",
                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500",
                            scrolled ? "text-zinc-900 active:bg-zinc-100" : "text-white active:bg-white/15"
                        )}
                    >
                        <AnimatePresence initial={false} mode="wait">
                            <motion.span
                                key={open ? "x" : "menu"}
                                initial={{ opacity: 0, rotate: -80, scale: 0.8 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, rotate: 80, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                className="absolute"
                            >
                                {open ? <X className="size-5" /> : <Menu className="size-5" />}
                            </motion.span>
                        </AnimatePresence>
                    </button>
                </div>
            </nav>

            <MobileMenu open={open} onClose={close} links={items} />
        </header>
    );
}

import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { currentYear, footerConfig } from "@/config/footer.config";
import { headerConfig } from "@/config/header.config";
import { FooterAccount } from "./footer-account";
import { footerLinkClass } from "./footer-link-class";
import { FooterWordmark } from "./footer-wordmark";
import { Logo } from "./logo";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </nav>
  );
}

export async function Footer() {
  const t = await getTranslations("sitefooter");
  const { pages, legal, socials } = footerConfig;
  const brand = headerConfig.brand.name;

  return (
    <footer className="p-2 sm:p-3">
      <div className="relative overflow-hidden rounded-[28px] bg-zinc-950 text-zinc-300">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
          <div className="pt-10">
            <div className="h-px bg-white/10" />
          </div>

          <div className="grid gap-12 py-14 md:grid-cols-[1fr_auto] md:gap-20 md:py-20">
            {/* Brand */}
            <div className="flex flex-col items-start gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
              >
                <Logo />
                <span className="text-[15px] font-semibold text-white">{brand}</span>
              </Link>
              <p className="mt-5 text-sm text-zinc-500">{t("copyright", { year: currentYear(), brand })}</p>
            </div>

            {/* Columns */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-4">
              <Column title={t("columns.pages")}>
                <ul className="space-y-4">
                  {pages.map((l) => (
                    <li key={l.labelKey}>
                      <Link href={l.href} className={footerLinkClass}>
                        {t(`links.${l.labelKey}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Column>

              <Column title={t("columns.socials")}>
                <ul className="space-y-4">
                  {socials.map((s) => (
                    <li key={s.id}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </Column>

              <Column title={t("columns.legal")}>
                <ul className="space-y-4">
                  {legal.map((l) => (
                    <li key={l.labelKey}>
                      <Link href={l.href} className={footerLinkClass}>
                        {t(`links.${l.labelKey}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Column>

              <Column title={t("columns.account")}>
                <FooterAccount />
              </Column>
            </div>
          </div>

          <div className="pb-4 sm:pb-6">
            <FooterWordmark text={brand} />
          </div>
        </div>
      </div>
    </footer>
  );
}

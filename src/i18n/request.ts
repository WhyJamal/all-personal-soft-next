import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "./config";

const NAMESPACES = ["common", "header", "hero", "footer", "landing", "products", "auth", "profile", "sitefooter", "manage", "nav", "notfound", "plans", "service", "reviews", "catalog", "contact"] as const;

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  const modules = await Promise.all(
    NAMESPACES.map((ns) => import(`../../messages/${locale}/${ns}.json`))
  );

  const messages = Object.fromEntries(
    NAMESPACES.map((ns, i) => [ns, modules[i].default])
  );

  return { locale, messages };
});

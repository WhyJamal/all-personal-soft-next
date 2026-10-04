import { getTranslations } from "next-intl/server";
import type { Product } from "@/lib/api/types";
import { fallbackModuleIcon, moduleIcons } from "@/config/modules.config";
import { HoverEffect } from "@/components/ui/hover-effect";
import { eyebrow, sectionTitle } from "./styles";

export async function ProductModules({ product }: { product: Product }) {
  const t = await getTranslations("products");
  const { modules } = product;
  if (modules.items.length === 0) return null;

  return (
    <section className="bg-zinc-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <p className={eyebrow}>{t("modules.eyebrow")}</p>
        {modules.title && <h2 className={sectionTitle}>{modules.title}</h2>}

        <HoverEffect className="-m-2 mt-10 grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
          {modules.items.map((m) => {
            const Icon = moduleIcons[m.id.toLowerCase()] ?? fallbackModuleIcon;
            return (
              <div
                key={m.id}
                className="flex h-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Icon className="size-5" />
                </span>
                <span className="text-base font-semibold text-zinc-900">{m.label}</span>
              </div>
            );
          })}
        </HoverEffect>
      </div>
    </section>
  );
}

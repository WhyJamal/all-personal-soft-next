"use client";

import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { linearGradient } from "./styles";
import type { Product } from "@/lib/api/types";

// Tilt/parallax is disabled for people who prefer reduced motion.
const noMotion = "motion-reduce:transform-none!";

type Props = {
  image: string | null;
  icon: string | null;
  gradient: Product["gradient"];
  /** Already formatted, e.g. "from 150 000 UZS / mo" */
  priceLabel: string | null;
};

export function ProductHeroVisual({ image, icon, gradient, priceLabel }: Props) {
  return (
    <CardContainer containerClassName="py-0" className={`w-full ${noMotion}`}>
      <CardBody className="relative h-auto! w-full!">
        <CardItem translateZ={40} className={`w-full! ${noMotion}`}>
          <div className="rounded-3xl border border-white/70 bg-white/60 p-2 shadow-2xl shadow-sky-900/15 backdrop-blur">
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-2xl"
              style={{ background: linearGradient(gradient) }}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="size-full object-cover" />
              ) : (
                icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={icon} alt="" className="absolute inset-0 m-auto size-1/3 object-contain" />
                )
              )}
            </div>
          </div>
        </CardItem>

        {icon && image && (
          <CardItem translateZ={90} className={`absolute -top-5 -left-4 ${noMotion}`}>
            <div className="flex size-14 items-center justify-center rounded-2xl border border-zinc-100 bg-white p-2.5 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt="" className="size-full object-contain" />
            </div>
          </CardItem>
        )}

        {priceLabel && (
          <CardItem translateZ={100} className={`absolute -right-3 -bottom-5 ${noMotion}`}>
            <div className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xl tabular-nums">
              {priceLabel}
            </div>
          </CardItem>
        )}
      </CardBody>
    </CardContainer>
  );
}

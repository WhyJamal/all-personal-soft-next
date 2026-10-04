"use client";

import { Icon } from "@iconify/react";
import "@/lib/iconify-offline";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

type FeatureCardProps = {
  title: string;
  desc: string;
  icon: string;
  image: string;
};

// Tilt/parallax is disabled for people who prefer reduced motion.
const noMotion = "motion-reduce:transform-none!";

export function FeatureCard({ title, desc, icon, image }: FeatureCardProps) {
  return (
    <CardContainer containerClassName="py-0" className={`w-full ${noMotion}`}>
      <CardBody className="group/card h-auto! w-full! rounded-2xl border border-zinc-200 bg-white p-3 transition-shadow duration-300 hover:shadow-2xl hover:shadow-sky-600/15">
        <CardItem translateZ={50} className={`w-full! ${noMotion}`}>
          <div className="overflow-hidden rounded-xl bg-sky-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              width={640}
              height={400}
              loading="lazy"
              className="aspect-8/5 w-full object-cover transition-transform duration-500 group-hover/card:scale-105 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
            />
          </div>
        </CardItem>

        <div className="px-2 pt-4 pb-3">
          <CardItem translateZ={40} className={`flex items-center gap-2.5 ${noMotion}`}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <Icon icon={icon} className="size-4.5" aria-hidden ssr />
            </span>
            <h3 className="text-base font-semibold tracking-tight text-zinc-900">{title}</h3>
          </CardItem>
          <CardItem
            as="p"
            translateZ={25}
            className={`mt-2.5 text-sm leading-relaxed text-zinc-500 ${noMotion}`}
          >
            {desc}
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}

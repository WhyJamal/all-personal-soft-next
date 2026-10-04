"use client";

import { useState } from "react";
import { Play } from "lucide-react";

type LiteYoutubeProps = {
  id: string;
  title: string;
  /** Accessible label for the play button */
  label: string;
};

/** Loads the real player only after a click, so the page stays light. */
export function LiteYoutube({ id, title, label }: LiteYoutubeProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-900 shadow-2xl shadow-sky-900/15">
      {playing ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={label}
          className="group absolute inset-0 size-full focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-sky-400"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-linear-to-t from-black/50 via-black/10 to-transparent" />
          <span className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sky-600 shadow-xl transition-transform duration-300 group-hover:scale-110">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/50 motion-reduce:hidden" />
            <Play className="relative size-6 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}

"use client";

import { useRef } from "react";
import type { WatchedFilm } from "@/lib/letterboxd";
import { prefersStill } from "@/lib/playback";
import { EndOfTape, shelfPlan, VhsTape } from "./vhs-tape";

type Props = {
  films: WatchedFilm[];
  profileUrl: string;
};

/**
 * Horizontal video-store shelf of the latest Letterboxd watches on the homepage.
 * It holds a fixed handful; a blank tape at the end hands off to /watched, which
 * has the whole feed.
 */
export function WatchingShelf({ films, profileUrl }: Props) {
  const shelf = useRef<HTMLDivElement>(null);

  function scrollShelf(direction: 1 | -1) {
    const el = shelf.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: prefersStill() ? "auto" : "smooth",
    });
  }

  const plan = shelfPlan(films);

  if (films.length === 0) {
    return (
      <div className="mt-8 flex">
        <EndOfTape href={profileUrl} note="Signal lost" label="Catch it on" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="mb-3 flex justify-end gap-2">
        {([-1, 1] as const).map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => scrollShelf(direction)}
            aria-label={direction === -1 ? "Scroll shelf left" : "Scroll shelf right"}
            className="osd flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line bg-screen-2 text-lg text-ink-soft transition-colors hover:border-glow hover:text-glow"
          >
            {direction === -1 ? "◀" : "▶"}
          </button>
        ))}
      </div>
      <div
        ref={shelf}
        role="region"
        aria-label="Recently watched films, from Letterboxd"
        tabIndex={0}
        className="-mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-5 px-5 pt-2 pb-6 focus-visible:outline-2 focus-visible:outline-glow sm:-mx-8 sm:scroll-px-8 sm:px-8"
      >
        {films.map((film, index) => (
          <VhsTape key={film.id} film={film} plan={plan[index]} />
        ))}
        <EndOfTape href="/watched" note="End of tape" label="See the whole shelf" target="/watched →" />
      </div>
    </div>
  );
}

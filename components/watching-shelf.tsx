"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WatchedFilm } from "@/lib/letterboxd";
import { EndOfTape, stickerPlan, VhsTape } from "./vhs-tape";

const PAGE_SIZE = 6;

type Props = {
  initial: WatchedFilm[];
  done: boolean;
  profileUrl: string;
};

function prefersStill() {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.dataset.playback === "paused"
  );
}

/**
 * Horizontal video-store shelf of recent Letterboxd watches. The first batch is
 * server-rendered; scrolling toward the end of the shelf pulls the next batch from
 * /watching.json until the feed runs out, then a blank tape links to the profile.
 */
export function WatchingShelf({ initial, done: initialDone, profileUrl }: Props) {
  const [films, setFilms] = useState(initial);
  const [done, setDone] = useState(initialDone);
  const loading = useRef(false);
  const shelf = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading.current || done) return;
    loading.current = true;
    try {
      const res = await fetch(`/watching.json?offset=${films.length}&limit=${PAGE_SIZE}`);
      const page: { entries: WatchedFilm[]; done: boolean } = await res.json();
      setFilms((current) => [...current, ...page.entries]);
      setDone(page.done || page.entries.length === 0);
    } catch {
      // Network hiccup: stop loading and hand off to Letterboxd
      setDone(true);
    } finally {
      loading.current = false;
    }
  }, [done, films.length]);

  useEffect(() => {
    const target = sentinel.current;
    if (!target || done) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      // Start fetching a couple of tapes before the shelf actually runs out
      { root: shelf.current, rootMargin: "0px 600px 0px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [done, loadMore]);

  function scrollShelf(direction: 1 | -1) {
    const el = shelf.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: prefersStill() ? "auto" : "smooth",
    });
  }

  const stickers = stickerPlan(films);

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
          <VhsTape key={film.id} film={film} index={index} stickers={stickers[index]} />
        ))}
        {done ? (
          <EndOfTape href={profileUrl} note="End of tape" label="See it all on" />
        ) : (
          <div ref={sentinel} className="osd flex w-24 flex-none items-center text-lg text-ink-faint">
            Rewinding…
          </div>
        )}
      </div>
    </div>
  );
}

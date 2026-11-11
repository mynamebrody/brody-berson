"use client";

import { useRef } from "react";
import { prefersStill } from "@/lib/playback";

/** The homepage shelf's scrolling row and its two arrow buttons; the tapes come in as children. */
export function ShelfScroller({ children }: { children: React.ReactNode }) {
  const shelf = useRef<HTMLDivElement>(null);

  function scrollShelf(direction: 1 | -1) {
    const el = shelf.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: prefersStill() ? "auto" : "smooth",
    });
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
        {children}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { TapeFilm } from "@/lib/letterboxd";

const SPOILER_WARNING = /^This review may contain spoilers\.?/i;

/**
 * Three-line excerpt under a tape on the homepage shelf; when it's cut off, "Read
 * full review" opens the dialog (FilmDialogHost picks up the click from data-film).
 * Reviews flagged as spoilers show only the warning. The text is the opening of
 * the review, cut on the server (`cut`); the whole of it is in the dialog.
 */
export function ReviewExcerpt({ excerpt, filmId }: { excerpt: NonNullable<TapeFilm["excerpt"]>; filmId: string }) {
  const review = excerpt.text;
  const spoiler = SPOILER_WARNING.test(review);
  const [clamped, setClamped] = useState(false);
  const paragraph = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = paragraph.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1);
  }, [review]);

  return (
    <>
      {spoiler ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft italic">This review may contain spoilers.</p>
      ) : (
        <p ref={paragraph} className="mt-2 line-clamp-3 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
          {review}
        </p>
      )}
      {spoiler || clamped || excerpt.cut ? (
        <button
          type="button"
          data-film={filmId}
          aria-haspopup="dialog"
          className="osd mt-1 cursor-pointer text-base text-ink-faint underline decoration-pop decoration-2 underline-offset-4 hover:text-glow"
        >
          Read full review →
        </button>
      ) : null}
    </>
  );
}

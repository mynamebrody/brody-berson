"use client";

import { useEffect, useRef, useState } from "react";

const SPOILER_WARNING = /^This review may contain spoilers\.?/i;

/**
 * Three-line excerpt under a tape on the homepage shelf; when it's cut off, "Read
 * full review" opens the dialog (FilmDialogHost picks up the click from data-film).
 * Reviews flagged as spoilers show only the warning.
 */
export function ReviewExcerpt({ review, filmId }: { review: string; filmId: string }) {
  const spoiler = SPOILER_WARNING.test(review);
  const [clamped, setClamped] = useState(false);
  const excerpt = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = excerpt.current;
    if (el) setClamped(el.scrollHeight > el.clientHeight + 1);
  }, [review]);

  return (
    <>
      {spoiler ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft italic">This review may contain spoilers.</p>
      ) : (
        <p ref={excerpt} className="mt-2 line-clamp-3 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
          {review}
        </p>
      )}
      {spoiler || clamped ? (
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

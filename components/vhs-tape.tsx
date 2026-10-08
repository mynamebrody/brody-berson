"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { WatchedFilm } from "@/lib/letterboxd";
import styles from "./vhs-tape.module.css";

const cases = ["black", "white", "cardboard"] as const;
const wears = ["faded", "creased", "scuffed", "torn", "scratched"] as const;
const bands = ["bandBlack", "bandCream", "bandRed", "bandBlue"] as const;
const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Small stable string hash (FNV-1a) so a film always gets the same look. */
function hash(value: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export type StickerPlan = { rewind: boolean; tape: boolean };

/**
 * Which tapes get a "Be kind rewind" sticker and which get a stray piece of old
 * tape: each roughly one in three, never on two tapes in a row. Depends only on
 * earlier films, so tapes already on the shelf keep their look as more load in.
 */
export function stickerPlan(films: WatchedFilm[]) {
  const plan: StickerPlan[] = [];
  films.forEach((film, i) => {
    const h = hash(film.id);
    const prev = plan[i - 1];
    plan.push({
      rewind: !prev?.rewind && h % 3 === 0,
      tape: !prev?.tape && (h >>> 3) % 3 === 1,
    });
  });
  return plan;
}

/**
 * Case style cycles by shelf position so neighbors never match; wear, tilt,
 * the bottom strip, and sticker placement come from the film's id, so they're
 * stable across renders and reloads.
 */
function variant(film: WatchedFilm, index: number) {
  const h = hash(film.id);
  const first = wears[h % wears.length];
  const second = wears[(h >>> 4) % wears.length];
  return {
    caseStyle: cases[index % cases.length],
    wear: (h >>> 8) % 3 === 0 || second === first ? [first] : [first, second],
    band: bands[(h >>> 10) % bands.length],
    tilt: (((h >>> 12) % 7) - 3) * 0.5,
    price: (h >>> 22) % 5 === 1,
    // Rewind sticker lands somewhere in the upper-left two thirds of the art
    rewindAt: {
      "--rewind-top": `${14 + ((h >>> 14) % 34)}%`,
      "--rewind-left": `${6 + ((h >>> 19) % 36)}%`,
      "--rewind-turn": `${((h >>> 24) % 41) - 20}deg`,
    },
    // The stray tape gets its own hash so it doesn't move in lockstep with the sticker
    tapeAt: (() => {
      const t = hash(`${film.id}:tape`);
      return {
        "--tape-top": `${8 + (t % 62)}%`,
        "--tape-left": `${4 + ((t >>> 6) % 42)}%`,
        "--tape-width": `${34 + ((t >>> 12) % 22)}%`,
        "--tape-turn": `${((t >>> 18) % 51) - 25}deg`,
      };
    })(),
  };
}

/** Long titles wrap onto two lines rather than shrinking to an unreadable size. */
const titleLines = (title: string) => (title.length > 24 ? 2 : 1);
/** Characters on the longest line, which is what the band's font size is fitted to. */
function titleChars(title: string) {
  if (titleLines(title) === 1) return title.length;
  const words = title.split(" ");
  let best = title.length;
  for (let i = 1; i < words.length; i++) {
    best = Math.min(best, Math.max(words.slice(0, i).join(" ").length, words.slice(i).join(" ").length));
  }
  return best;
}

export function stars(rating: number | null) {
  if (rating === null) return null;
  return "★".repeat(Math.floor(rating)) + (rating % 1 ? "½" : "");
}

/** "2026-10-06" → "OCT 06 2026", without going through Date (no timezone drift). */
export function watchedOn(date: string) {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${months[Number(month) - 1]} ${day} ${year}` : date;
}

const SPOILER_WARNING = /^This review may contain spoilers\.?/i;

/**
 * Three-line excerpt; when it's cut off, "Read full review" opens the whole thing
 * in a dialog (native <dialog>: focus trap, Esc to close, top layer above the shelf).
 * Reviews flagged as spoilers show only the warning until the dialog is opened.
 */
function Review({ film, rating }: { film: WatchedFilm; rating: string | null }) {
  const review = film.review ?? "";
  const spoiler = SPOILER_WARNING.test(review);
  const [clamped, setClamped] = useState(false);
  const excerpt = useRef<HTMLParagraphElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

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
          onClick={() => dialog.current?.showModal()}
          aria-haspopup="dialog"
          className="osd mt-1 cursor-pointer text-base text-ink-faint underline decoration-pop decoration-2 underline-offset-4 hover:text-glow"
        >
          Read full review →
        </button>
      ) : null}
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        // Clicking the backdrop (the dialog element itself, outside the panel) closes it
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current.close();
        }}
        className="m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl border border-line bg-screen-2 p-0 text-ink shadow-[0_30px_70px_-30px_rgba(5,6,26,0.8)] backdrop:bg-deep/60 backdrop:backdrop-blur-sm"
      >
        <div className="grid gap-6 p-6 sm:grid-cols-[9rem_1fr] sm:p-8">
          {film.poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={film.poster}
              alt=""
              className="hidden w-36 rounded-md border border-line shadow-lg sm:block"
            />
          ) : null}
          <div className="min-w-0">
            <p className="osd text-base text-ink-faint">Review · Watched {watchedOn(film.watchedDate)}</p>
            <h3 id={titleId} className="mt-1 font-display text-3xl leading-tight font-semibold tracking-wide uppercase">
              {film.title}
              {film.year ? <span className="text-ink-faint"> ({film.year})</span> : null}
            </h3>
            <p className="osd mt-1 text-lg text-ink-soft">
              {[rating, film.liked ? "♥ Liked" : null, film.rewatch ? "Rewatch" : null].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-4 leading-relaxed whitespace-pre-line text-ink-soft">{review}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a href={film.url} className="gloss rounded-full px-5 py-2 text-sm font-semibold">
                Open on Letterboxd →
              </a>
              <button
                type="button"
                autoFocus
                onClick={() => dialog.current?.close()}
                className="osd cursor-pointer rounded-full border border-line px-4 py-1.5 text-base text-ink-soft transition-colors hover:border-glow hover:text-glow"
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function VhsTape({
  film,
  index,
  stickers,
}: {
  film: WatchedFilm;
  index: number;
  stickers: StickerPlan;
}) {
  const v = variant(film, index);
  const newRelease = film.year !== null && film.watchedDate.startsWith(String(film.year));
  const rating = stars(film.rating);
  const classes = [
    styles.tape,
    styles[v.caseStyle],
    styles[v.band],
    ...v.wear.map((w) => styles[w]),
    stickers.tape ? styles.taped : "",
  ];

  return (
    <article className={styles.slot}>
      <div className={styles.bay}>
        <a
          href={film.url}
          className={classes.join(" ")}
          style={{ "--tilt": `${v.tilt}deg`, ...v.rewindAt, ...v.tapeAt } as React.CSSProperties}
          aria-label={`${film.title}${film.year ? ` (${film.year})` : ""} on Letterboxd`}
        >
          <span className={styles.case}>
            <span className={styles.sleeve}>
              <span className={styles.art}>
                {film.poster ? (
                  // Letterboxd's CDN already serves sized posters; skip next/image optimization
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={film.poster} alt="" loading="lazy" decoding="async" className={styles.poster} />
                ) : (
                  <span className={styles.noPoster}>{film.title}</span>
                )}
              </span>
              <span
                className={styles.band}
                style={{ "--chars": titleChars(film.title), "--lines": titleLines(film.title) } as React.CSSProperties}
                aria-hidden="true"
              >
                <span className={styles.bandTitle}>{film.title}</span>
              </span>
              <span className={styles.wear} aria-hidden="true" />
            </span>
            <span className={styles.plastic} aria-hidden="true" />

            {newRelease ? (
              <span className={styles.ribbon} aria-hidden="true">
                <span>New release</span>
              </span>
            ) : null}
            {rating ? <span className={`${styles.sticker} ${styles.rating}`}>{rating}</span> : null}
            {v.price && !rating ? (
              <span className={`${styles.sticker} ${styles.price}`} aria-hidden="true">
                $2.99
              </span>
            ) : null}
            {stickers.rewind ? (
              <span className={`${styles.sticker} ${styles.rewind}`} aria-hidden="true">
                Be kind
                <br />
                rewind
              </span>
            ) : null}
            {film.rewatch ? <span className={`${styles.sticker} ${styles.rewatch}`}>Rewatch</span> : null}
            {film.liked ? <span className={`${styles.sticker} ${styles.staffPick}`}>Staff pick ♥</span> : null}
          </span>
        </a>
      </div>

      <div className="mt-4 px-1">
        <h3 className="font-display text-lg leading-tight font-semibold tracking-wide uppercase">
          <a href={film.url} className="hover:text-glow">
            {film.title}
          </a>
        </h3>
        <p className="osd mt-0.5 text-base text-ink-faint">
          {[film.year, rating, film.liked ? "♥" : null].filter(Boolean).join(" · ")}
        </p>
        <p className="osd text-sm text-ink-faint">Watched {watchedOn(film.watchedDate)}</p>
        {film.review ? <Review film={film} rating={rating} /> : null}
      </div>
    </article>
  );
}

/** Blank tape that closes out the shelf (or stands in when the feed is down). */
export function EndOfTape({ href, label, note }: { href: string; label: string; note: string }) {
  return (
    <article className={styles.slot}>
      <div className={styles.bay}>
        <a href={href} className={`${styles.tape} ${styles.black} ${styles.bandBlack} ${styles.blank}`}>
          <span className={styles.case}>
            <span className={styles.sleeve}>
              <span className={styles.art}>
                <span className={styles.blankLabel}>
                  <span className="osd text-base">{note}</span>
                  <span className="font-display text-2xl leading-none font-semibold tracking-wide uppercase">
                    {label}
                  </span>
                  <span className="osd text-base">Letterboxd →</span>
                </span>
              </span>
              <span className={styles.band} style={{ "--chars": 11 } as React.CSSProperties} aria-hidden="true">
                <span className={styles.bandTitle}>T-120 Blank</span>
              </span>
            </span>
            <span className={styles.plastic} aria-hidden="true" />
          </span>
        </a>
      </div>
    </article>
  );
}

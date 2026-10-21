"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { WatchedFilm } from "@/lib/letterboxd";
import { prefersStill } from "@/lib/playback";
import { BroadcastTexture } from "./broadcast-fx";
import styles from "./vhs-tape.module.css";

/** Everything that can happen to a rental box after a few hundred trips home. */
const slipcaseWear = [
  "sunFaded",
  "edgeworn",
  "edgeChipped",
  "cornersRubbed",
  "shelfScuffed",
  "dogEared",
  "torn",
  "crushedCorner",
  "creased",
  "waterStain",
  "residue",
  "scratched",
  "grimy",
  "peeling",
  "splitSeam",
  "foxing",
] as const;
type Wear = (typeof slipcaseWear)[number];
/** A clamshell protects the paper insert, so only some damage gets through the plastic. */
const clamshellWear: readonly Wear[] = ["sunFaded", "dogEared", "creased", "residue", "scratched", "grimy", "foxing"];
/** At most one from each group per tape: the members pile up on the same edges and corners. */
const exclusiveWear: readonly (readonly Wear[])[] = [
  ["torn", "dogEared", "crushedCorner"],
  ["edgeworn", "edgeChipped", "cornersRubbed", "shelfScuffed"],
];
/** Board the slipcase is printed on: what shows through where the print is worn off. */
const stocks = ["kraft", "chipboard", "bleached"] as const;
const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** New Release stickers are color-coded by genre, like the shelf dots at a rental store. */
const genreColors: [RegExp, string, string][] = [
  [/horror/i, "#b3121b", "#ffffff"],
  [/thriller|crime|mystery/i, "#5b2a86", "#ffffff"],
  [/comedy/i, "#ffd23f", "#1a1a1a"],
  [/action|adventure|war|western/i, "#ff6a13", "#ffffff"],
  [/romance/i, "#ff5fa2", "#ffffff"],
  [/science fiction|sci-fi|fantasy/i, "#16a3a3", "#ffffff"],
  [/animation|family|kids/i, "#3bb54a", "#ffffff"],
  [/documentary|music|history/i, "#c98a1a", "#ffffff"],
  [/drama/i, "#2f62d8", "#ffffff"],
];
const defaultGenreColor = ["#e8392f", "#ffffff"];

function genreColor(genre: string | null) {
  const match = genre ? genreColors.find(([pattern]) => pattern.test(genre)) : undefined;
  return match ? [match[1], match[2]] : defaultGenreColor;
}

/** Previously Viewed stickers came off whatever roll was at the counter. */
const pvShapes = ["burst", "round", "scallop", "oval"] as const;
const pvColors = [
  ["#ff5a1f", "#fff8e6"],
  ["#e8392f", "#ffffff"],
  ["#ffd23f", "#1a1a1a"],
  ["#8ee04a", "#10240a"],
  ["#2f62d8", "#ffffff"],
];

/** Small stable string hash (FNV-1a) so a film always gets the same look. */
function hash(value: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** An upright-enough tilt, so a sticker always stays readable: -max…+max degrees. */
const turn = (h: number, max: number) => `${(h % (max * 2 + 1)) - max}deg`;
/** A percentage between min and max. */
const between = (h: number, min: number, max: number) => min + (h % (max - min + 1));

export type TapePlan = {
  stock: (typeof stocks)[number];
  wear: Wear[];
  rewind: boolean;
  label: boolean;
};

/** Two or three kinds of wear, none of them shared with the tape before it. */
function pickWear(film: WatchedFilm, prev: Wear[]) {
  const pool = (film.disney ? clamshellWear : slipcaseWear).filter((w) => !prev.includes(w));
  const ranked = pool
    .map((w) => [w, hash(`${film.id}:${w}`)] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([w]) => w);
  const count = 2 + ((hash(film.id) >>> 5) % 2);
  const picked: Wear[] = [];
  for (const w of ranked) {
    if (picked.length === count) break;
    if (exclusiveWear.some((group) => group.includes(w) && picked.some((p) => group.includes(p)))) continue;
    picked.push(w);
  }
  return picked;
}

/**
 * The shelf's look, tape by tape: board stock and wear never repeat between
 * neighbors; "Be kind rewind" stickers and BBTV Video store labels each land on
 * roughly one in three, never two in a row. Depends only on earlier films, so
 * tapes already on the shelf keep their look as more load in.
 */
export function shelfPlan(films: WatchedFilm[]) {
  const plan: TapePlan[] = [];
  films.forEach((film, i) => {
    const h = hash(film.id);
    const prev = plan[i - 1];
    let stock = stocks[(h >>> 26) % stocks.length];
    if (stock === prev?.stock) stock = stocks[((h >>> 26) + 1) % stocks.length];
    plan.push({
      stock,
      wear: pickWear(film, prev?.wear ?? []),
      rewind: !prev?.rewind && h % 3 === 0,
      label: !prev?.label && (h >>> 3) % 3 === 1,
    });
  });
  return plan;
}

/**
 * Tilt, the price sticker, and where each sticker and bit of damage lands come
 * from the film's id, so they're stable across renders and reloads. Each sticker
 * stays in its own zone of the box: New Release top left, rating or price top
 * right, rewind in the upper middle, Staff Pick bottom left, the store label and
 * Previously Viewed bottom right (Previously Viewed stacks above the label).
 */
function variant(film: WatchedFilm, plan: TapePlan) {
  const h = hash(film.id);
  const a = hash(`${film.id}:fx`);
  const b = hash(`${film.id}:fx2`);
  const c = hash(`${film.id}:fx3`);
  const k = hash(`${film.id}:crease`);
  const s1 = hash(`${film.id}:sticker`);
  const s2 = hash(`${film.id}:sticker2`);
  const s3 = hash(`${film.id}:sticker3`);
  const [nrBg, nrInk] = genreColor(film.genre);
  const [pvBg, pvInk] = pvColors[(s3 >>> 20) % pvColors.length];
  const labelBottom = between(s2 >>> 18, 3, 8);
  return {
    tilt: (((h >>> 12) % 7) - 3) * 0.5,
    price: (h >>> 22) % 5 === 1,
    earLeft: (a >>> 25) % 2 === 1,
    pvShape: pvShapes[(s3 >>> 26) % pvShapes.length],
    stockNo: String((c >>> 3) % 100000).padStart(5, "0"),
    stickersAt: {
      "--nr-top": `${between(s1, 2, 10)}%`,
      "--nr-left": `${between(s1 >>> 4, 2, 12)}%`,
      "--nr-turn": turn(s1 >>> 8, 12),
      "--nr-bg": nrBg,
      "--nr-ink": nrInk,
      "--rating-top": `${between(s1 >>> 13, 2, 7)}%`,
      "--rating-right": `${between(s1 >>> 17, 3, 9)}%`,
      "--rating-turn": turn(s1 >>> 21, 9),
      "--rewind-top": `${between(h >>> 14, 26, 48)}%`,
      "--rewind-left": `${between(h >>> 19, 6, 40)}%`,
      "--rewind-turn": turn(h >>> 24, 12),
      "--staff-bottom": `${between(s2, 3, 11)}%`,
      "--staff-left": `${between(s2 >>> 4, 3, 10)}%`,
      "--staff-turn": turn(s2 >>> 8, 12),
      "--label-bottom": `${labelBottom}%`,
      "--label-right": `${between(s2 >>> 22, 3, 9)}%`,
      "--label-turn": turn(s2 >>> 26, 5),
      // Just above the store label when there is one, otherwise anywhere low on the right
      "--pv-bottom": plan.label ? `calc(${labelBottom}% + 30px)` : `${between(s3, 3, 13)}%`,
      "--pv-right": `${between(s3 >>> 5, 3, 14)}%`,
      "--pv-turn": turn(s3 >>> 10, 12),
      "--pv-bg": pvBg,
      "--pv-ink": pvInk,
    },
    // Placement for whichever wear the tape ended up with
    wearAt: {
      "--fade-angle": `${[90, 180, 270, 0][a % 4]}deg`,
      "--ear": `${22 + ((a >>> 2) % 14)}px`,
      "--crease-flip": (a >>> 6) % 2 ? 1 : -1,
      "--stain-x": `${15 + ((a >>> 7) % 65)}%`,
      "--stain-y": `${18 + ((a >>> 13) % 60)}%`,
      "--stain-r": `${18 + ((a >>> 19) % 18)}px`,
      "--residue-x": `${8 + (b % 46)}%`,
      "--residue-y": `${10 + ((b >>> 6) % 70)}%`,
      "--residue-turn": `${((b >>> 13) % 31) - 15}deg`,
      "--scratch-angle": `${[35, 58, 122, 145][(b >>> 18) % 4] + ((b >>> 20) % 12)}deg`,
      "--flip": (b >>> 24) % 2 ? 1 : -1,
      "--seam-y": `${10 + ((b >>> 25) % 45)}%`,
      "--fox-x": `${20 + ((c >>> 1) % 60)}%`,
      "--fox-y": `${20 + ((c >>> 7) % 60)}%`,
      // Creases: a mostly-vertical fold, a mostly-horizontal one, and a stray diagonal,
      // each somewhere different (and some fainter or missing) on every tape
      "--c1-angle": `${80 + (k % 31)}deg`,
      "--c1-pos": `${18 + ((k >>> 5) % 65)}%`,
      "--c2-angle": `${-14 + ((k >>> 11) % 29)}deg`,
      "--c2-pos": `${15 + ((k >>> 16) % 70)}%`,
      "--c2-alpha": [0, 0.6, 0.85, 1][(k >>> 21) % 4],
      "--c3-angle": `${20 + ((k >>> 23) % 140)}deg`,
      "--c3-pos": `${15 + ((c >>> 14) % 70)}%`,
      "--c3-alpha": [0, 0.5, 0.8, 1][(c >>> 22) % 4],
    },
  };
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

/** Matches the tune-out duration on .tv-dialog[data-closing] in globals.css. */
const CLOSE_MS = 240;

/**
 * Three-line excerpt; when it's cut off, "Read full review" opens the whole thing
 * in a dialog (native <dialog>: focus trap, Esc to close, top layer above the shelf)
 * that tunes in like a channel change.
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

  // Play the tune-out (data-closing, styled in globals.css) before actually closing
  function close() {
    const el = dialog.current;
    if (!el?.open || el.dataset.closing !== undefined) return;
    if (prefersStill()) {
      el.close();
      return;
    }
    el.dataset.closing = "";
    window.setTimeout(() => {
      delete el.dataset.closing;
      el.close();
    }, CLOSE_MS);
  }

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
          if (event.target === dialog.current) close();
        }}
        // Esc closes through the same animated path
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        // The dialog is a transparent full-viewport layer holding the panel and the
        // broadcast texture. Modal dialogs render in the top layer, above the page-level
        // texture, so they need their own copy to stay "on TV".
        className="tv-dialog m-0 h-dvh max-h-none w-full max-w-none place-items-center overflow-hidden border-0 bg-transparent p-0 text-ink open:grid backdrop:bg-deep/60 backdrop:backdrop-blur-sm"
      >
        <div className="tv-dialog-panel scanlines grid max-h-[85dvh] w-[calc(100%-2rem)] max-w-2xl gap-6 overflow-y-auto overscroll-contain rounded-2xl border border-line bg-screen-2 p-6 shadow-[0_0_0_6px_rgba(5,6,26,0.85),0_30px_70px_-30px_var(--signal)] sm:grid-cols-[9rem_1fr] sm:p-8">
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
                onClick={close}
                className="osd cursor-pointer rounded-full border border-line px-4 py-1.5 text-base text-ink-soft transition-colors hover:border-glow hover:text-glow"
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
        {/* After the panel so the texture stays on top while the panel's entrance runs */}
        <div className="tv-dialog-fx pointer-events-none fixed inset-0">
          <BroadcastTexture />
        </div>
      </dialog>
    </>
  );
}

export function VhsTape({ film, plan }: { film: WatchedFilm; plan: TapePlan }) {
  const v = variant(film, plan);
  const rating = stars(film.rating);
  const classes = [
    styles.tape,
    film.disney ? styles.clamshell : styles.slipcase,
    styles[plan.stock],
    ...plan.wear.map((w) => styles[w]),
    plan.wear.includes("dogEared") && v.earLeft ? styles.earLeft : "",
  ];

  return (
    <article className={styles.slot}>
      <div className={styles.bay}>
        <a
          href={film.url}
          className={classes.join(" ")}
          style={{ "--tilt": `${v.tilt}deg`, ...v.stickersAt, ...v.wearAt } as React.CSSProperties}
          aria-label={`${film.title}${film.year ? ` (${film.year})` : ""} on Letterboxd`}
        >
          {/* The tape inside a slipcase, which slides out the open bottom on hover */}
          {film.disney ? null : <span className={styles.cassette} aria-hidden="true" />}
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
              {plan.wear.map((w) => (
                <span key={w} className={styles.fx} data-fx={w} aria-hidden="true" />
              ))}
              <span className={styles.grain} aria-hidden="true" />
            </span>
            {plan.wear.includes("dogEared") ? <span className={styles.ear} aria-hidden="true" /> : null}
            <span className={styles.plastic} aria-hidden="true" />

            {film.newRelease ? (
              <span className={`${styles.sticker} ${styles.newRelease}`} aria-hidden="true">
                New
                <br />
                release
              </span>
            ) : null}
            {rating ? <span className={`${styles.sticker} ${styles.rating}`}>{rating}</span> : null}
            {v.price && !rating ? (
              <span className={`${styles.sticker} ${styles.price}`} aria-hidden="true">
                $2.99
              </span>
            ) : null}
            {plan.rewind ? (
              <span className={`${styles.sticker} ${styles.rewind}`} aria-hidden="true">
                Be kind
                <br />
                rewind
              </span>
            ) : null}
            {film.liked ? (
              <span className={`${styles.sticker} ${styles.staffPick}`}>
                Staff
                <br />
                pick
              </span>
            ) : null}
            {plan.label ? (
              <span className={`${styles.sticker} ${styles.storeLabel}`} aria-hidden="true">
                BBTV Video · {v.stockNo}
              </span>
            ) : null}
            {film.rewatch ? (
              <span className={`${styles.sticker} ${styles.previouslyViewed}`} data-shape={v.pvShape}>
                Previously
                <br />
                viewed
              </span>
            ) : null}
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
        <a href={href} className={`${styles.tape} ${styles.slipcase} ${styles.bleached} ${styles.blank}`}>
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
              <span className={styles.grain} aria-hidden="true" />
            </span>
            <span className={styles.plastic} aria-hidden="true" />
          </span>
        </a>
      </div>
    </article>
  );
}

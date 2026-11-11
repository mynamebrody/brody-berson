"use client";

import type { TapeFilm } from "@/lib/letterboxd";
import { posterSizes, posterSrcSet, stars, variant, watchedOn, type TapePlan } from "@/lib/tape-look";
import styles from "../vhs-tape.module.css";
import { ReviewExcerpt } from "./review-excerpt";

/**
 * One film on a shelf. "shelf" is the homepage's scrolling row; "wall" packs into
 * the /watched rack with a shelf-edge label in place of the caption; "lead" is a
 * wall tape on the rack's first shelf (the latest three), given more room.
 * Clicking any tape puts the film on TV: a dialog with its videos, the diary
 * entry, the review when there is one, and a link to Letterboxd.
 *
 * No state of its own: everything that opens the dialog is a button carrying
 * data-film, and the one FilmDialogHost around the shelf handles the click.
 * The film prop is the slim TapeFilm (no review text, no trailers).
 * It's a client component only to keep the page small. Rendered on the server,
 * each tape's markup (dozens of inline custom properties) ships twice, in the
 * HTML and again in the RSC payload, which nearly doubled /watched; as a client
 * component only its props do.
 */
export function VhsTape({
  film,
  plan,
  size = "shelf",
}: {
  film: TapeFilm;
  plan: TapePlan;
  size?: "shelf" | "wall" | "lead";
}) {
  const v = variant(film, plan);
  const rating = stars(film.rating);
  const name = `${film.title}${film.year ? ` (${film.year})` : ""}`;
  const classes = [
    styles.tape,
    film.clamshell ? styles.clamshell : styles.slipcase,
    film.clamshell === "nickelodeon" ? styles.nickelodeon : "",
    styles[plan.stock],
    ...plan.wear.map((w) => styles[w]),
    plan.wear.includes("dogEared") && v.earLeft ? styles.earLeft : "",
  ];
  const slot = {
    shelf: styles.slot,
    wall: `${styles.slot} ${styles.wall}`,
    lead: `${styles.slot} ${styles.wall} ${styles.lead}`,
  }[size];

  const box = (
    <>
      {/* The tape inside a slipcase, which slides out the open bottom on hover */}
      {film.clamshell ? null : <span className={styles.cassette} aria-hidden="true" />}
      <span className={styles.case}>
        <span className={styles.sleeve}>
          <span className={styles.art}>
            {film.poster ? (
              // Letterboxd's CDN already serves sized posters; skip next/image optimization.
              // The rack's first shelf is on screen at load, so those three don't wait.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={film.poster}
                srcSet={posterSrcSet(film.poster)}
                sizes={posterSizes[size]}
                width={600}
                height={900}
                alt=""
                loading={size === "lead" ? "eager" : "lazy"}
                decoding="async"
                className={styles.poster}
              />
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
    </>
  );
  const tapeProps = {
    className: classes.join(" "),
    style: { "--tilt": `${v.tilt}deg`, ...v.stickersAt, ...v.wearAt } as React.CSSProperties,
  };

  return (
    <article className={slot}>
      <div className={styles.bay}>
        <button
          type="button"
          data-film={film.id}
          aria-haspopup="dialog"
          aria-label={`${name}: ${film.hasReview ? "review and trailers" : "trailers and details"}`}
          {...tapeProps}
        >
          {box}
        </button>
      </div>

      {size === "shelf" ? (
        <div className="mt-4 px-1">
          <h3 className="font-display text-lg leading-tight font-semibold tracking-wide uppercase">
            <button
              type="button"
              data-film={film.id}
              aria-haspopup="dialog"
              className="cursor-pointer text-left uppercase hover:text-glow"
            >
              {film.title}
            </button>
          </h3>
          <p className="osd mt-0.5 text-base text-ink-faint">
            {[film.year, rating, film.liked ? "♥" : null].filter(Boolean).join(" · ")}
          </p>
          <p className="osd text-sm text-ink-faint">Watched {watchedOn(film.watchedDate)}</p>
          {film.excerpt ? <ReviewExcerpt excerpt={film.excerpt} filmId={film.id} /> : null}
        </div>
      ) : (
        // Price-channel strip on the shelf lip: title, date, stars, and the way into the review
        <div className={styles.shelfTag}>
          <h3
            title={film.title}
            className="truncate font-display text-sm leading-tight font-semibold tracking-wide uppercase"
          >
            {film.title}
          </h3>
          <p className="osd mt-0.5 text-sm leading-none text-ink-faint">{watchedOn(film.watchedDate)}</p>
          {/* Every film's dialog is its review (rating and diary entry, plus the text when there is one) */}
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <span className="osd text-sm leading-none whitespace-nowrap text-ink-soft">
              {[rating, film.liked ? "♥" : null].filter(Boolean).join(" ")}
            </span>
            <button
              type="button"
              data-film={film.id}
              aria-haspopup="dialog"
              aria-label={`Read the review of ${name}`}
              className="osd cursor-pointer text-sm leading-none whitespace-nowrap text-ink-faint underline decoration-pop decoration-2 underline-offset-2 hover:text-glow"
            >
              Review →
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

/** Blank tape that closes out the shelf (or stands in when the feed is down). */
export function EndOfTape({
  href,
  label,
  note,
  target = "Letterboxd →",
  wall = false,
}: {
  href: string;
  label: string;
  note: string;
  target?: string;
  /** Sitting in the /watched rack rather than the homepage's scrolling shelf */
  wall?: boolean;
}) {
  return (
    <article className={wall ? `${styles.slot} ${styles.wall}` : styles.slot}>
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
                  <span className="osd text-base">{target}</span>
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

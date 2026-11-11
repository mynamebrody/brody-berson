"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FilmDetailsById, TapeFilm } from "@/lib/letterboxd";
import { prefersStill } from "@/lib/playback";
import { stars, watchedOn } from "@/lib/tape-look";
import { BroadcastTexture } from "../broadcast-fx";
import { loadFilmDetails } from "./film-details";
import { TrailerScreen } from "./trailer-screen";

/** Matches the tune-out duration on .tv-dialog[data-closing] in globals.css. */
const CLOSE_MS = 240;

/**
 * The one TV for a whole shelf of tapes. The tapes inside are server-rendered;
 * anything in them carrying data-film="<id>" (the box, the title, the review
 * buttons) opens that film here, picked up by one click handler on the wrapper.
 *
 * The film goes on TV in a native <dialog> (focus trap, Esc to close, top layer
 * above the shelf) that tunes in like a channel change: the poster, the diary
 * entry, and the review if there is one, with the film's videos on a TV below.
 * Closing hands focus back to whatever opened it.
 *
 * The page only carries each film's header (TapeFilm). Reviews and trailers for
 * the whole shelf come from /watched/details in one request, sent the first time
 * a pointer or the keyboard lands on a tape, so they are usually here before the
 * click. If the request fails, or doesn't know the film, the dialog still has its
 * header and the Letterboxd link, over a TV with no signal.
 */
export function FilmDialogHost({ films, children }: { films: TapeFilm[]; children: React.ReactNode }) {
  const [film, setFilm] = useState<TapeFilm | null>(null);
  // null until the details arrive
  const [details, setDetails] = useState<FilmDetailsById | "failed" | null>(null);
  const asked = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Show the dialog once React has rendered the film into it
  useEffect(() => {
    const el = dialog.current;
    if (film && el && !el.open) {
      el.showModal();
      closeButton.current?.focus();
    }
  }, [film]);

  function fetchDetails() {
    if (asked.current) return;
    asked.current = true;
    // A retry after a failure goes back to waiting
    setDetails((current) => (current === "failed" ? null : current));
    loadFilmDetails().then(setDetails, () => setDetails("failed"));
  }

  // Hovering, touching or tabbing onto anything that opens a film
  function reachedFor(event: React.SyntheticEvent) {
    if ((event.target as Element).closest?.("[data-film]")) fetchDetails();
  }

  function openFromClick(event: React.MouseEvent) {
    const trigger = (event.target as Element).closest<HTMLElement>("[data-film]");
    const next = trigger ? films.find((f) => f.id === trigger.dataset.film) : undefined;
    if (!trigger || !next) return;
    opener.current = trigger;
    // Opening a film is worth another try after a failure; hovering past one isn't
    if (details === "failed") asked.current = false;
    fetchDetails();
    setFilm(next);
  }

  // Play the tune-out (data-closing, styled in globals.css) before actually closing
  function closeFilm() {
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

  // Unmounting the film unmounts the player, which stops the trailer; the next
  // open starts back on channel one.
  function closed() {
    setFilm(null);
    // Safari doesn't focus a button on click, so the browser's own restore can miss
    opener.current?.focus({ preventScroll: true });
    opener.current = null;
  }

  const rating = film ? stars(film.rating) : null;
  const waiting = details === null;
  const detail = film && details && details !== "failed" ? details[film.id] : undefined;

  return (
    <>
      {/* display: contents, so the wrapper adds a click target without a layout box */}
      <div className="contents" onClick={openFromClick} onPointerOver={reachedFor} onFocus={reachedFor}>
        {children}
      </div>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        // Clicking the backdrop (the dialog element itself, outside the panel) closes it
        onClick={(event) => {
          if (event.target === dialog.current) closeFilm();
        }}
        // Esc closes through the same animated path
        onCancel={(event) => {
          event.preventDefault();
          closeFilm();
        }}
        onClose={closed}
        // The dialog is a transparent full-viewport layer holding the panel and the
        // broadcast texture. Modal dialogs render in the top layer, above the page-level
        // texture, so they need their own copy to stay "on TV".
        className="tv-dialog m-0 h-dvh max-h-none w-full max-w-none place-items-center overflow-hidden border-0 bg-transparent p-0 text-ink open:grid backdrop:bg-deep/60 backdrop:backdrop-blur-sm"
      >
        {film ? (
          <>
            <div
              className={`tv-dialog-panel scanlines grid max-h-[85dvh] w-[calc(100%-2rem)] grid-cols-1 gap-6 overflow-y-auto overscroll-contain rounded-2xl border border-line bg-screen-2 p-5 shadow-[0_0_0_6px_rgba(5,6,26,0.85),0_30px_70px_-30px_var(--signal)] sm:p-8 ${film.hasTrailers ? "max-w-3xl" : "max-w-2xl"}`}
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-[9rem_minmax(0,1fr)]">
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
                  <h3
                    id={titleId}
                    className="mt-1 font-display text-3xl leading-tight font-semibold tracking-wide uppercase"
                  >
                    {film.title}
                    {film.year ? <span className="text-ink-faint"> ({film.year})</span> : null}
                  </h3>
                  <p className="osd mt-1 text-lg text-ink-soft">
                    {[rating, film.liked ? "♥ Liked" : null, film.rewatch ? "Rewatch" : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {detail?.review ? (
                    <p className="mt-4 leading-relaxed wrap-anywhere whitespace-pre-line text-ink-soft">
                      {detail.review}
                    </p>
                  ) : waiting && film.hasReview ? (
                    <p role="status" className="osd mt-4 text-base text-ink-faint">
                      Tuning in…
                    </p>
                  ) : null}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href={film.url}
                      className="gloss inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold pointer-coarse:min-h-11 pointer-coarse:py-0"
                    >
                      Open on Letterboxd →
                    </a>
                    <button
                      ref={closeButton}
                      type="button"
                      onClick={closeFilm}
                      className="osd cursor-pointer rounded-full border border-line px-4 py-1.5 text-base text-ink-soft transition-colors hover:border-glow hover:text-glow pointer-coarse:min-h-11 pointer-coarse:py-0"
                    >
                      Close ✕
                    </button>
                  </div>
                </div>
              </div>
              <TrailerScreen
                key={film.id}
                trailers={detail?.trailers ?? []}
                title={film.title}
                pending={waiting && film.hasTrailers}
              />
            </div>
            {/* After the panel so the texture stays on top while the panel's entrance runs */}
            <div className="tv-dialog-fx pointer-events-none fixed inset-0">
              <BroadcastTexture />
            </div>
          </>
        ) : null}
      </dialog>
    </>
  );
}

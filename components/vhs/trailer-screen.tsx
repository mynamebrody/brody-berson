"use client";

import { useState } from "react";
import type { Trailer } from "@/lib/letterboxd";
import { prefersStill } from "@/lib/playback";
import { ColorBars } from "../color-bars";

/** Videos are on the 100s: CH 101, CH 102, … */
const channelNo = (index: number) => `CH ${101 + index}`;

/**
 * The film's YouTube videos (trailers first) on a little CRT. It waits on the trailer's thumbnail
 * until Play is pressed (no YouTube player loads before that); CH −/CH + flip
 * between trailers through a burst of static, and once one is playing the next
 * starts on its own. Mounted only while the dialog is open, so closing the
 * dialog stops playback and the next open starts back on channel one.
 */
export function TrailerScreen({
  trailers,
  title,
  pending = false,
}: {
  trailers: Trailer[];
  title: string;
  /** The film has trailers but they are still on their way from /watched/details */
  pending?: boolean;
}) {
  const [channel, setChannel] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [tune, setTune] = useState(0);
  // The channel number sits on the paused screen, then only flashes on channel changes
  // so it isn't left over YouTube's own title bar
  const [osd, setOsd] = useState(true);
  const trailer = trailers[channel];

  function play() {
    setPlaying(true);
    setOsd(false);
  }

  function changeChannel(step: number) {
    setChannel((current) => (current + step + trailers.length) % trailers.length);
    setOsd(true);
    if (!prefersStill()) setTune((n) => n + 1);
  }

  return (
    // Width comes from the panel (min-w-0), never from the video name under it, so the
    // set stays the same size on every channel. Phones let it spill into the panel's
    // padding for a bigger picture; landscape phones cap it by height so it fits on screen.
    <section
      aria-label="Trailers"
      className="mx-auto w-full max-w-[calc(70dvh*16/9)] min-w-0 max-sm:-mx-2 max-sm:w-[calc(100%+1rem)] max-sm:max-w-none"
    >
      <div className="rounded-[18px] bg-deep p-2 shadow-[0_0_0_6px_rgba(5,6,26,0.85),0_0_50px_-12px_var(--glow)] sm:p-2.5">
        <div className="relative aspect-video overflow-hidden rounded-[12px] bg-black">
          {!trailer ? (
            <div className="absolute inset-0">
              <ColorBars size="fill" />
              <p className="osd absolute inset-0 grid place-items-center text-3xl text-white [text-shadow:0_0_10px_rgba(5,6,26,0.9),0_2px_0_rgba(5,6,26,0.9)]">
                {pending ? "Stand by" : "No signal"}
              </p>
            </div>
          ) : playing ? (
            <iframe
              key={`video:${trailer.key}`}
              src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0&playsinline=1&modestbranding=1`}
              title={`${title} trailer: ${trailer.name}`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={play}
              aria-label={`Play ${title} trailer: ${trailer.name}`}
              className="group absolute inset-0 cursor-pointer"
            >
              {/* YouTube's own thumbnail; hqdefault exists for every video (letterboxed 4:3, cropped by cover) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${trailer.key}/hqdefault.jpg`}
                alt=""
                className="h-full w-full object-cover opacity-85 [filter:saturate(0.85)_contrast(1.1)] transition-opacity group-hover:opacity-100"
              />
              <span className="osd absolute inset-0 grid place-items-center">
                <span className="rounded-full border border-white/40 bg-deep/70 px-5 py-1.5 text-2xl text-white shadow-[0_0_24px_-4px_var(--glow)] transition-colors group-hover:border-glow group-hover:text-glow">
                  ▶ Play
                </span>
              </span>
            </button>
          )}

          {trailer && osd ? (
            <p
              key={`osd:${channel}`}
              aria-hidden="true"
              className={`osd pointer-events-none absolute top-3 left-4 text-2xl leading-none text-[#8ee04a] [text-shadow:0_0_6px_rgba(142,224,74,0.6),0_2px_0_rgba(5,6,26,0.85)] ${playing ? "channel-osd" : ""}`}
            >
              {channelNo(channel)}
            </p>
          ) : null}
          {tune ? (
            <span key={`static:${tune}`} className="channel-static pointer-events-none absolute inset-0" aria-hidden="true" />
          ) : null}
          {/* Aperture grille and glass, over the picture without taking its clicks */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(5,6,26,0.22) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(5,6,26,0.12) 0 1px, transparent 1px 3px)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[12px] bg-[radial-gradient(ellipse_at_24%_12%,rgba(255,255,255,0.16),transparent_45%)] shadow-[inset_0_0_40px_rgba(5,6,26,0.7)]"
          />
        </div>
      </div>

      {trailer ? (
        <div className="mt-3 grid gap-2">
          {/* Up to two lines, and always two lines' room when there are channels to flip,
              so the buttons below stay put from one video name to the next */}
          <p
            aria-live="polite"
            title={trailer.name}
            className={`osd line-clamp-2 text-base leading-snug wrap-anywhere text-ink-faint ${trailers.length > 1 ? "min-h-[2lh]" : ""}`}
          >
            <span className="sr-only">Now showing: </span>
            {trailer.name}
          </p>
          {trailers.length > 1 ? (
            // A full-width remote on phones, compact and to the right otherwise
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => changeChannel(-1)}
                aria-label="Previous trailer"
                className="osd cursor-pointer rounded-full border border-line px-3 py-1 text-base text-ink-soft transition-colors hover:border-glow hover:text-glow max-sm:flex-1 pointer-coarse:min-h-11 pointer-coarse:px-4 pointer-coarse:py-0"
              >
                CH −
              </button>
              <span className="osd w-[5ch] text-center text-base text-ink-faint tabular-nums" aria-hidden="true">
                {channel + 1}/{trailers.length}
              </span>
              <button
                type="button"
                onClick={() => changeChannel(1)}
                aria-label="Next trailer"
                className="osd cursor-pointer rounded-full border border-line px-3 py-1 text-base text-ink-soft transition-colors hover:border-glow hover:text-glow max-sm:flex-1 pointer-coarse:min-h-11 pointer-coarse:px-4 pointer-coarse:py-0"
              >
                CH +
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

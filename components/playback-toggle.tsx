"use client";

import { useSyncExternalStore } from "react";
import { getPlayback, setPlayback, subscribePlayback } from "@/lib/playback";

const getServerPlayback = () => "playing" as const;

/**
 * Play / Pause for the site's motion (grain, flicker, light leaks, blinking OSD).
 * Pause freezes everything on the current frame and shows a VHS pause screen;
 * Play picks up where it left off. Remembered across visits.
 *
 * Below lg the PAUSE indicator is a badge on the button rather than a label drawn
 * over the page (wide screens keep that one, in broadcast-fx.module.css).
 */
export function PlaybackToggle({ className = "" }: { className?: string }) {
  const playback = useSyncExternalStore(subscribePlayback, getPlayback, getServerPlayback);
  const paused = playback === "paused";

  return (
    <span className="relative flex shrink-0">
      {/* Shown by CSS off data-playback, like the button's labels, so it is right before hydration.
          It hangs off the button's lower edge, inside the header bar, so it takes no room in the row. */}
      <span
        aria-hidden="true"
        className="osd pointer-events-none absolute top-[calc(100%-4px)] left-1/2 z-10 hidden h-4 -translate-x-1/2 items-center rounded-sm bg-[#04061a] px-1.5 text-sm leading-none text-white [text-shadow:-1px_0_rgba(255,60,140,0.7),1px_0_rgba(40,210,255,0.7)] max-lg:paused:flex print:hidden"
      >
        Pause
      </span>
      <button
      type="button"
      onClick={() => setPlayback(paused ? "playing" : "paused")}
      aria-pressed={paused}
      aria-label="Pause motion"
      title={paused ? "Play: resume the broadcast effects" : "Pause: freeze the broadcast effects"}
      className={`osd flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-screen-2 px-3 text-base text-ink-soft transition-colors hover:border-glow hover:text-glow ${className}`}
    >
      {/* Labels are CSS-driven off data-playback so the first paint is right even before hydration */}
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-4 paused:hidden">
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
      <span className="hidden sm:inline sm:paused:hidden">Pause</span>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="hidden size-4 paused:block">
        <path d="M7 4.8v14.4a1 1 0 0 0 1.52.85l11.5-7.2a1 1 0 0 0 0-1.7L8.52 3.95A1 1 0 0 0 7 4.8Z" />
      </svg>
      <span className="hidden sm:paused:inline">Play</span>
      </button>
    </span>
  );
}

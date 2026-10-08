"use client";

import { useSyncExternalStore } from "react";

const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// Real date and time, camcorder-style.
function stamp(now: Date) {
  const hours = now.getHours();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    time: `${hours < 12 ? "AM" : "PM"} ${pad(hours % 12 || 12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
    date: `${months[now.getMonth()]}. ${pad(now.getDate())} ${now.getFullYear()}`,
  };
}

// A one-second clock as an external store: whole seconds on the client, null on the server
function subscribe(onTick: () => void) {
  const id = setInterval(onTick, 1000);
  return () => clearInterval(id);
}
const getSecond = () => Math.floor(Date.now() / 1000);
const getServerSecond = () => null;

/**
 * Camcorder on-screen display pinned to the bottom corners on wide screens.
 * Renders a static placeholder on the server, then ticks once hydrated.
 */
export function CamcorderOsd() {
  const second = useSyncExternalStore(subscribe, getSecond, getServerSecond);
  const { time, date } =
    second === null ? { time: "-- --:--:--", date: "--- -- ----" } : stamp(new Date(second * 1000));

  return (
    <div
      aria-hidden="true"
      className="osd pointer-events-none fixed inset-x-0 bottom-0 z-[45] hidden justify-between px-16 pb-6 text-lg leading-tight text-glow xl:flex print:hidden"
    >
      <div className="self-end">
        <p>SP ▮▮▮▯</p>
      </div>
      <div className="text-right tabular-nums">
        <p className="text-[#d81b4f] dark:text-pop">
          <span className="rec-blink">●</span> REC
        </p>
        <p>{time}</p>
        <p>{date}</p>
      </div>
    </div>
  );
}

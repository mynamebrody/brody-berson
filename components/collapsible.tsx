"use client";

import { useId, useState } from "react";

/**
 * A header bar that slides its body open and shut. Height animates through a
 * grid-rows 0fr → 1fr transition (works in every browser, unlike animating
 * <details>), and the body fades and settles in as it opens. Collapsed by default.
 * Style open-state bits with group-data-open: (the root carries data-open).
 */
export function Collapsible({
  summary,
  children,
  className = "",
  summaryClassName = "",
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  summaryClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  return (
    <div data-open={open ? "" : undefined} className={`group ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((value) => !value)}
        className={`group/summary w-full cursor-pointer text-left ${summaryClassName}`}
      >
        {summary}
      </button>
      {/* Snaps instead of sliding under reduced motion or site-wide Pause */}
      <div
        id={bodyId}
        inert={!open}
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-data-open:grid-rows-[1fr] motion-reduce:transition-none paused:transition-none"
      >
        <div className="min-h-0 overflow-hidden">
          <div className="-translate-y-3 opacity-0 transition-[opacity,translate] duration-300 ease-out group-data-open:translate-y-0 group-data-open:opacity-100 group-data-open:delay-150 motion-reduce:transition-none paused:transition-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * Daytime / Primetime switch for the site theme ("light" / "dark" under the hood).
 * The current theme lives on <html data-theme="...">, set before first paint by
 * the script in layout.tsx. Which label shows is pure CSS (dark: variant), so no
 * client state is needed and there is nothing to mismatch on hydration.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const apply = () => {
      root.dataset.theme = next;
    };

    // Animate the switch as a channel change where supported (styles in globals.css),
    // unless motion is reduced by the OS or paused on the site
    const reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      root.dataset.playback === "paused";
    if (document.startViewTransition && !reduceMotion) {
      document.startViewTransition(apply);
    } else {
      apply();
    }

    // If the choice matches the system preference, drop the override so the
    // site keeps following the OS setting; otherwise persist it.
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    try {
      if (next === system) {
        localStorage.removeItem("theme");
      } else {
        localStorage.setItem("theme", next);
      }
    } catch {
      // localStorage unavailable; the toggle still works for this page view
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between Daytime and Primetime"
      title="Switch between Daytime and Primetime"
      className={`osd flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-screen-2 px-3 text-base text-ink-soft transition-colors hover:border-glow hover:text-glow ${className}`}
    >
      {/* Moon + PRIMETIME: shown in dark mode (label from sm up) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="hidden size-4 dark:block"
      >
        <path d="M20.4 14.55a8.6 8.6 0 0 1-10.95-10.95.75.75 0 0 0-.99-.93 9.9 9.9 0 1 0 12.87 12.87.75.75 0 0 0-.93-.99Z" />
      </svg>
      <span className="hidden sm:dark:inline">Primetime</span>
      {/* Sun + DAYTIME: shown in light mode (label from sm up) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="size-4 dark:hidden"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.55 1.55M17.15 17.15l1.55 1.55M18.7 5.3l-1.55 1.55M6.85 17.15L5.3 18.7" />
      </svg>
      <span className="hidden sm:inline sm:dark:hidden">Daytime</span>
    </button>
  );
}

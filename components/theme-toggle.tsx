"use client";

/**
 * Sun/moon toggle for the site theme. The current theme lives on
 * <html data-theme="...">, set before first paint by the script in layout.tsx.
 * Icon visibility is pure CSS (dark: variant), so no client state is needed
 * and there is nothing to mismatch on hydration.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;

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
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={`grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-cream text-ink-soft transition-colors hover:border-blue hover:text-blue-ink ${className}`}
    >
      {/* Sun: shown in dark mode (click to go light) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="hidden size-[18px] dark:block"
      >
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.55 1.55M17.15 17.15l1.55 1.55M18.7 5.3l-1.55 1.55M6.85 17.15L5.3 18.7" />
      </svg>
      {/* Moon: shown in light mode (click to go dark) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-[18px] dark:hidden"
      >
        <path d="M20.4 14.55a8.6 8.6 0 0 1-10.95-10.95.75.75 0 0 0-.99-.93 9.9 9.9 0 1 0 12.87 12.87.75.75 0 0 0-.93-.99Z" />
      </svg>
    </button>
  );
}

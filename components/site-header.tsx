import Link from "next/link";
import { site } from "@/content/site";
import { PlaybackToggle } from "./playback-toggle";
import { ThemeToggle } from "./theme-toggle";

const pages = [
  { id: "resume", href: "/resume", label: "Resume" },
  { id: "watched", href: "/watched", label: "Watched" },
] as const;

type Props = {
  /** The page this header is on, so its own link can be marked (and dropped where space is short) */
  current: "home" | (typeof pages)[number]["id"];
  /** Stays at the top of the screen while the page scrolls */
  sticky?: boolean;
  /** The page's own button (Download PDF, Letterboxd), ahead of the toggles */
  action?: React.ReactNode;
};

/**
 * The one header for /, /resume and /watched: the name (home), the pages, the /mcp
 * jump link, then the page's own action and the theme and playback toggles.
 *
 * Everything navigational sits on the left so the middle of the bar stays empty on
 * wide screens, where the PAUSE label is drawn (broadcast-fx.module.css). It is one
 * row at every width: below md the link to the page you are already on is left out,
 * and under 380px the name shortens to "Brody".
 */
export function SiteHeader({ current, sticky = false, action }: Props) {
  const [first, ...rest] = site.name.split(" ");

  return (
    <header
      className={`border-b border-line/60 bg-screen/50 print:hidden ${sticky ? "sticky top-0 z-10 backdrop-blur-md" : "relative"}`}
    >
      <a
        href="#main"
        className="gloss sr-only rounded-full px-5 py-2 text-sm font-semibold focus:not-sr-only focus:absolute focus:top-2.5 focus:left-4 focus:z-20"
      >
        Skip to content
      </a>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-5 py-3 sm:gap-3 sm:px-8">
        <div className="flex items-center gap-2.5 sm:gap-5">
          <Link
            href="/"
            aria-current={current === "home" ? "page" : undefined}
            className="font-display text-xl font-semibold tracking-wide whitespace-nowrap text-glow uppercase sm:text-2xl"
          >
            {first}
            {rest.length ? <span className="max-[379px]:sr-only"> {rest.join(" ")}</span> : null}
          </Link>
          <nav aria-label="Site" className="flex items-center gap-2.5 text-sm sm:gap-4">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={page.href}
                aria-current={page.id === current ? "page" : undefined}
                className={`font-medium text-ink-soft transition-colors hover:text-glow aria-[current=page]:text-ink ${page.id === current ? "max-md:hidden" : ""}`}
              >
                {page.label}
              </Link>
            ))}
            {/* Room for it from md on the homepage; pages with an action button need lg */}
            <Link
              href="/#mcp"
              className={`osd hidden rounded-md border border-line bg-screen-2 px-2.5 py-0.5 text-base text-ink-soft transition-colors hover:border-glow hover:text-glow ${action ? "lg:block" : "md:block"}`}
            >
              /mcp
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {action}
          <ThemeToggle />
          <PlaybackToggle />
        </div>
      </div>
    </header>
  );
}

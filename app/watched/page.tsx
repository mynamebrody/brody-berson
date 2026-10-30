import type { Metadata } from "next";
import Link from "next/link";
import { ColorBars } from "@/components/color-bars";
import { PlaybackToggle } from "@/components/playback-toggle";
import { SiteFooter } from "@/components/site-footer";
import { ThemeToggle } from "@/components/theme-toggle";
import { WatchedWall } from "@/components/watched-wall";
import { getRecentlyWatched } from "@/lib/letterboxd";

// Restocked from the Letterboxd feed hourly, same as the homepage shelf
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Watched",
  description:
    "What Brody Berson has been watching: his recent Letterboxd diary as a wall of worn rental-store VHS boxes, with ratings and reviews.",
};

export default async function WatchedPage() {
  const watched = await getRecentlyWatched();

  return (
    <>
      <header className="border-b border-line/60 bg-screen/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="osd text-lg whitespace-nowrap text-ink-soft normal-case transition-colors hover:text-glow"
          >
            ◀ <span className="sm:hidden">Home</span>
            <span className="hidden sm:inline">brodyberson.com</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={watched.profileUrl}
              className="gloss rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap sm:px-5"
            >
              Letterboxd ↗
            </a>
            <ThemeToggle />
            <PlaybackToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 sm:px-8">
        <section className="pt-14 pb-14 sm:pt-20">
          <p className="osd fade-up text-xl text-ink-faint">▶ Now showing · CH 501</p>
          <h1
            className="title-glow fade-up mt-3 font-display text-6xl leading-[0.9] font-semibold tracking-wide uppercase sm:text-8xl"
            style={{ animationDelay: "60ms" }}
          >
            What I&rsquo;ve been watching.
          </h1>
          <p
            className="fade-up mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft"
            style={{ animationDelay: "120ms" }}
          >
            Straight from my{" "}
            <a
              href={watched.profileUrl}
              className="font-medium text-ink underline decoration-pop decoration-2 underline-offset-4 hover:text-glow"
            >
              Letterboxd
            </a>{" "}
            diary, restocked every hour. The latest three are on the top shelf, and it works
            back from there. Pick up a box to read what I thought.
          </p>
        </section>

        <ColorBars />

        <WatchedWall films={watched.entries} profileUrl={watched.profileUrl} />
      </main>

      <SiteFooter />
    </>
  );
}

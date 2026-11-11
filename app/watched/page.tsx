import type { Metadata } from "next";
import { ColorBars } from "@/components/color-bars";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WatchedWall } from "@/components/watched-wall";
import { site } from "@/content/site";
import { getRecentlyWatched, getRecentlyWatchedForPage, ogVersion } from "@/lib/letterboxd";
import { socialMetadata } from "@/lib/metadata";

// Restocked from the Letterboxd feed hourly, same as the homepage shelf
export const revalidate = 3600;

// Named in full (no layout template) so the title fills the 50-60 characters search results show
const title = `Recently Watched · ${site.name}’s Letterboxd Video Store`;
const description =
  `${site.name}’s recent Letterboxd diary as a wall of worn rental-store VHS tapes, with ratings and reviews.`;

// The share image shows the latest three films. Its URL carries a fingerprint of them,
// so it is only rendered anew when the feed's top three change.
export async function generateMetadata(): Promise<Metadata> {
  const { entries } = await getRecentlyWatched();
  const image = entries.length ? `/watched/og?v=${ogVersion(entries)}` : "/open-graph.png";
  return {
    title: { absolute: title },
    description,
    ...socialMetadata({ path: "/watched", title, description, image }),
  };
}

export default async function WatchedPage() {
  const watched = await getRecentlyWatchedForPage();

  return (
    <>
      <SiteHeader
        current="watched"
        action={
          // Below md the bar has no room for it; the intro's first line links Letterboxd too
          <a
            href={watched.profileUrl}
            className="gloss rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap max-md:hidden"
          >
            Letterboxd ↗
          </a>
        }
      />

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-5 outline-none sm:px-8">
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

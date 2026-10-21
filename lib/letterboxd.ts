import { XMLParser } from "fast-xml-parser";
import { letterboxd } from "@/content/site";

export type WatchedFilm = {
  id: string;
  title: string;
  year: number | null;
  /** Stars out of 5 in half steps, or null when the watch wasn't rated */
  rating: number | null;
  liked: boolean;
  rewatch: boolean;
  /** ISO date (YYYY-MM-DD) */
  watchedDate: string;
  url: string;
  poster: string | null;
  /** Plain-text review, or null for a diary entry without one */
  review: string | null;
  /** Walt Disney / Pixar production (via TMDB); the shelf gives these the white clamshell */
  disney: boolean;
  /** First TMDB genre ("Horror", "Comedy", …), which colors the shelf's New Release sticker */
  genre: string | null;
  /** Released (or first aired) within the last year, per TMDB */
  newRelease: boolean;
};

type TmdbRef = { kind: "movie" | "tv"; id: string };
type TmdbFacts = Pick<WatchedFilm, "disney" | "genre" | "newRelease">;

export type RecentlyWatched = {
  entries: WatchedFilm[];
  profileUrl: string;
};

type FeedItem = Record<string, string | { "#text": string } | undefined>;

// parseTagValue: false keeps titles like "1917" as strings; entities are decoded below
const parser = new XMLParser({
  ignoreAttributes: true,
  parseTagValue: false,
  isArray: (name) => name === "item",
});

const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

function decode(value: string) {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return namedEntities[code.toLowerCase()] ?? match;
  });
}

function text(value: FeedItem[string]) {
  if (value === undefined) return "";
  return decode(typeof value === "string" ? value : value["#text"]).trim();
}

/** Review paragraphs from the description HTML, minus the poster and "Watched on …" diary line. */
function reviewText(html: string) {
  const paragraphs = [...html.matchAll(/<p>([\s\S]*?)<\/p>/g)]
    .map((m) => decode(m[1].replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "")).trim())
    .filter((p) => p && !/^Watched on /.test(p));
  return paragraphs.length ? paragraphs.join("\n\n") : null;
}

type ParsedFilm = Omit<WatchedFilm, keyof TmdbFacts> & { tmdb: TmdbRef | null };

function toFilm(item: FeedItem): ParsedFilm | null {
  const id = text(item.guid);
  // Lists (letterboxd-list-*) aren't films
  if (!/^letterboxd-(review|watch)-/.test(id)) return null;
  const description = typeof item.description === "string" ? item.description : "";
  const rating = Number(text(item["letterboxd:memberRating"]));
  const year = Number(text(item["letterboxd:filmYear"]));
  return {
    id,
    title: text(item["letterboxd:filmTitle"]),
    year: year || null,
    rating: rating > 0 ? rating : null,
    liked: text(item["letterboxd:memberLike"]) === "Yes",
    rewatch: text(item["letterboxd:rewatch"]) === "Yes",
    watchedDate: text(item["letterboxd:watchedDate"]),
    url: text(item.link),
    poster: description.match(/<img src="([^"]+)"/)?.[1] ?? null,
    review: reviewText(description),
    tmdb: tmdbRef(item),
  };
}

/** Films carry a tmdb:movieId; shows logged on Letterboxd carry a tmdb:tvId instead. */
function tmdbRef(item: FeedItem): TmdbRef | null {
  const movie = text(item["tmdb:movieId"]);
  if (movie) return { kind: "movie", id: movie };
  const tv = text(item["tmdb:tvId"]);
  return tv ? { kind: "tv", id: tv } : null;
}

const DISNEY_STUDIO = /^(Walt Disney (Pictures|Productions|Animation Studios|Feature Animation)|Pixar)/;
const NO_FACTS: TmdbFacts = { disney: false, genre: null, newRelease: false };

/** "YYYY-MM-DD" a year before today, for comparing against TMDB release dates. */
function oneYearAgo() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().slice(0, 10);
}

/**
 * Studio, genre, and release date from TMDB, for how the tape looks on the shelf.
 * None of it changes, so lookups cache for a week; "new release" is re-judged
 * against today every time the feed revalidates. No TMDB_API_KEY or a failed
 * lookup just means a plain slipcase with no New Release sticker.
 */
async function tmdbFacts(ref: TmdbRef | null): Promise<TmdbFacts> {
  const key = process.env.TMDB_API_KEY;
  if (!ref || !key) return NO_FACTS;
  try {
    const res = await fetch(`https://api.themoviedb.org/3/${ref.kind}/${ref.id}?api_key=${key}`, {
      next: { revalidate: 604800 },
    });
    if (!res.ok) return NO_FACTS;
    const details: {
      production_companies?: { name: string }[];
      genres?: { name: string }[];
      release_date?: string;
      first_air_date?: string;
    } = await res.json();
    const released = details.release_date || details.first_air_date || "";
    return {
      disney: (details.production_companies ?? []).some((company) => DISNEY_STUDIO.test(company.name)),
      genre: details.genres?.[0]?.name ?? null,
      newRelease: released !== "" && released >= oneYearAgo(),
    };
  } catch {
    return NO_FACTS;
  }
}

/**
 * Brody's Letterboxd RSS feed (the latest ~50 diary entries), cached for an hour.
 * Never throws: a failed fetch returns no entries so pages and tools can fall back
 * to the profile link.
 */
export async function getRecentlyWatched(): Promise<RecentlyWatched> {
  try {
    const res = await fetch(letterboxd.rss, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Letterboxd RSS responded ${res.status}`);
    const feed = parser.parse(await res.text());
    const items: FeedItem[] = feed?.rss?.channel?.item ?? [];
    const parsed = items.map(toFilm).filter((film): film is ParsedFilm => film !== null);
    const entries = await Promise.all(
      parsed.map(async ({ tmdb, ...film }) => ({ ...film, ...(await tmdbFacts(tmdb)) }))
    );
    return { entries, profileUrl: letterboxd.profile };
  } catch (error) {
    console.error("[letterboxd]", error);
    return { entries: [], profileUrl: letterboxd.profile };
  }
}

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
};

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

function toFilm(item: FeedItem): WatchedFilm | null {
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
  };
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
    const entries = items.map(toFilm).filter((film): film is WatchedFilm => film !== null);
    return { entries, profileUrl: letterboxd.profile };
  } catch (error) {
    console.error("[letterboxd]", error);
    return { entries: [], profileUrl: letterboxd.profile };
  }
}

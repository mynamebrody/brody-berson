import { cache } from "react";
import { XMLParser } from "fast-xml-parser";
import { letterboxd } from "@/content/site";
import { hash } from "@/lib/tape-look";

/** A YouTube trailer, by video key */
export type Trailer = { key: string; name: string };

export type Clamshell = "disney" | "nickelodeon";

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
  /** Studio behind a clamshell release (via TMDB): white for Disney / Pixar, orange for Nickelodeon; null is a slipcase */
  clamshell: Clamshell | null;
  /** First TMDB genre ("Horror", "Comedy", …), which colors the shelf's New Release sticker */
  genre: string | null;
  /** Released (or first aired) within the last year, per TMDB */
  newRelease: boolean;
  /** US classification per TMDB ("R", "PG-13", "TV-MA", …), printed in the box's corner; null when unrated or unknown */
  certification: string | null;
  /** The film's YouTube videos on TMDB (its own language, English, spoken languages), trailers first; empty without TMDB_API_KEY */
  trailers: Trailer[];
};

/** The part of a film that only its dialog shows, served by /watched/details */
export type FilmDetails = Pick<WatchedFilm, "review" | "trailers">;
export type FilmDetailsById = Record<string, FilmDetails>;

/**
 * A film as the page ships it: everything on the tape's face and in the dialog's
 * header. The review and the trailers stay behind and are fetched once, from
 * /watched/details, when someone reaches for a tape.
 */
export type TapeFilm = Omit<WatchedFilm, keyof FilmDetails> & {
  hasReview: boolean;
  /** Decides the dialog's width before the trailers themselves arrive */
  hasTrailers: boolean;
  /** Opening of the review, for the homepage shelf where it sits under the tape */
  excerpt: { text: string; cut: boolean } | null;
};

const SPOILER_WARNING = /^This review may contain spoilers\.?/i;
/** Several times what the shelf's three-line clamp can show, so the clamp still decides where it ends */
const EXCERPT_CHARS = 240;

function reviewExcerpt(review: string): NonNullable<TapeFilm["excerpt"]> {
  // Spoiler reviews show only Letterboxd's warning on the shelf, so that is all that ships
  if (SPOILER_WARNING.test(review)) return { text: "This review may contain spoilers.", cut: true };
  if (review.length <= EXCERPT_CHARS) return { text: review, cut: false };
  const head = review.slice(0, EXCERPT_CHARS);
  return { text: `${head.slice(0, Math.max(head.lastIndexOf(" "), EXCERPT_CHARS / 2)).trimEnd()}…`, cut: true };
}

/** Slim a film down to what its tape needs; `excerpt` is for shelves that print review text. */
export function tapeFilm({ review, trailers, ...film }: WatchedFilm, { excerpt = false } = {}): TapeFilm {
  return {
    ...film,
    hasReview: review !== null,
    hasTrailers: trailers.length > 0,
    excerpt: excerpt && review ? reviewExcerpt(review) : null,
  };
}

type TmdbRef = { kind: "movie" | "tv"; id: string };
type TmdbFacts = Pick<WatchedFilm, "clamshell" | "genre" | "newRelease" | "certification" | "trailers">;

export type RecentlyWatched = {
  entries: WatchedFilm[];
  profileUrl: string;
  /** False when the feed couldn't be read, as opposed to a diary with nothing in it */
  ok: boolean;
};

/** A slow upstream shouldn't hold a page render open: give up and fall back instead */
const FEED_TIMEOUT_MS = 8000;
const TMDB_TIMEOUT_MS = 5000;
/** Films looked up on TMDB at once (each is two requests, one after the other) */
const TMDB_CONCURRENCY = 8;

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
// "Nickelodeon Movies", "Nickelodeon Animation Studio", … (not the unrelated "Nickel Odeon")
const NICKELODEON_STUDIO = /^Nickelodeon\b/;
const NO_FACTS: TmdbFacts = { clamshell: null, genre: null, newRelease: false, certification: null, trailers: [] };

type TmdbClassifications = {
  /** Films: every release in every country, each with its own certificate */
  release_dates?: { results?: { iso_3166_1: string; release_dates?: { certification?: string }[] }[] };
  /** Shows: one rating per country */
  content_ratings?: { results?: { iso_3166_1: string; rating?: string }[] };
};

/** Short enough to print in a corner box: "R", "PG-13", "NC-17", "TV-MA". Anything wordier ("Not Rated") is left off. */
const PRINTABLE_CERTIFICATION = /^[A-Z0-9-]{1,5}$/;

/** The US classification, from the first American release that carries one. */
function usCertification({ release_dates, content_ratings }: TmdbClassifications): string | null {
  const us = <T extends { iso_3166_1: string }>(results: T[] = []) => results.find((r) => r.iso_3166_1 === "US");
  const found =
    us(release_dates?.results)?.release_dates?.find((release) => release.certification)?.certification ??
    us(content_ratings?.results)?.rating ??
    "";
  return PRINTABLE_CERTIFICATION.test(found) ? found : null;
}

/** Disney wins a co-production, since its clamshells came first. */
function clamshellFor(companies: { name: string }[] = []): Clamshell | null {
  if (companies.some((company) => DISNEY_STUDIO.test(company.name))) return "disney";
  if (companies.some((company) => NICKELODEON_STUDIO.test(company.name))) return "nickelodeon";
  return null;
}
const MAX_TRAILERS = 12;
/** Channel order: trailers, then teasers, clips, and the rest */
const VIDEO_TYPES = ["Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes", "Bloopers"];

type TmdbVideo = {
  key: string;
  name: string;
  site: string;
  type: string;
  iso_639_1?: string;
  official?: boolean;
  published_at?: string;
};

/**
 * Every YouTube video, whatever its language or type. Trailers come first, then
 * teasers, clips, and the rest; within a type, the film's own language and English
 * lead, then official uploads, then the newest.
 */
function youtubeVideos(videos: TmdbVideo[], originalLanguage: string | undefined): Trailer[] {
  const typeRank = (video: TmdbVideo) => {
    const rank = VIDEO_TYPES.indexOf(video.type);
    return rank === -1 ? VIDEO_TYPES.length : rank;
  };
  const languageRank = (video: TmdbVideo) =>
    video.iso_639_1 === originalLanguage ? 0 : video.iso_639_1 === "en" ? 1 : 2;
  return videos
    .filter((video) => video.site === "YouTube" && video.key)
    .sort(
      (a, b) =>
        typeRank(a) - typeRank(b) ||
        languageRank(a) - languageRank(b) ||
        Number(b.official ?? false) - Number(a.official ?? false) ||
        (b.published_at ?? "").localeCompare(a.published_at ?? "")
    )
    .slice(0, MAX_TRAILERS)
    .map(({ key, name }) => ({ key, name }));
}

/** TMDB reads only the first five codes of include_video_language (and has no wildcard) */
const MAX_VIDEO_LANGUAGES = 5;

/**
 * The languages worth asking TMDB for videos in: the film's own, English, the
 * languages spoken in it, and "null" for untagged uploads. Without
 * include_video_language TMDB only returns videos in the request's language (en-US).
 */
function videoLanguages(original: string | undefined, spoken: { iso_639_1: string }[] = []) {
  const codes = [original, "en", ...spoken.map((language) => language.iso_639_1)].filter(
    (code): code is string => Boolean(code)
  );
  return [...new Set(codes)].slice(0, MAX_VIDEO_LANGUAGES - 1).concat("null").join(",");
}

/**
 * Stop waiting on `work` after `ms`. A timer rather than an abort signal, because
 * Next drops a fetch's signal when it is refreshing a stale cached response, which
 * is exactly when a hung upstream would otherwise hold the render open. The
 * request itself is left to finish or fail on its own.
 */
function within<T>(ms: number, what: string, work: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${what} didn't answer in ${ms} ms`)), ms);
  });
  return Promise.race([work, timeout]).finally(() => clearTimeout(timer));
}

/**
 * A TMDB request, cached for a week; null if it fails or is refused.
 * TMDB_API_KEY can be either kind of credential: a v3 API key goes in the query
 * string, a v4 read access token (a JWT) in a bearer header.
 */
function tmdbJson<T>(path: string, key: string, query = ""): Promise<T | null> {
  const bearer = key.startsWith("eyJ");
  const params = [bearer ? "" : `api_key=${key}`, query].filter(Boolean).join("&");
  const request = fetch(`https://api.themoviedb.org/3/${path}${params ? `?${params}` : ""}`, {
    headers: bearer ? { Authorization: `Bearer ${key}` } : undefined,
    next: { revalidate: 604800 },
  }).then((res) => (res.ok ? (res.json() as Promise<T>) : null));
  return within(TMDB_TIMEOUT_MS, "TMDB", request);
}

/** A film's YouTube videos, or none if the lookup fails (the rest of the tape still renders). */
async function tmdbVideos(path: string, key: string, languages: string): Promise<TmdbVideo[]> {
  try {
    const videos = await tmdbJson<{ results?: TmdbVideo[] }>(path, key, `include_video_language=${languages}`);
    return videos?.results ?? [];
  } catch {
    return [];
  }
}

/** "YYYY-MM-DD" a year before today, for comparing against TMDB release dates. */
function oneYearAgo() {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date.toISOString().slice(0, 10);
}

/**
 * Studio, genre, release date, and US classification from TMDB, for how the tape looks on the shelf,
 * then its YouTube videos for the TV in the film dialog (a second request, since
 * which languages to ask for depends on the details). None of it changes much,
 * so lookups cache for a week; "new release" is re-judged
 * against today every time the feed revalidates. No TMDB_API_KEY or a failed
 * lookup just means a plain slipcase with no New Release sticker.
 */
async function tmdbFacts(ref: TmdbRef | null): Promise<TmdbFacts> {
  const key = process.env.TMDB_API_KEY;
  if (!ref || !key) return NO_FACTS;
  try {
    const base = `${ref.kind}/${ref.id}`;
    const details = await tmdbJson<
      {
        production_companies?: { name: string }[];
        genres?: { name: string }[];
        release_date?: string;
        first_air_date?: string;
        original_language?: string;
        spoken_languages?: { iso_639_1: string }[];
      } & TmdbClassifications
    >(base, key, `append_to_response=${ref.kind === "movie" ? "release_dates" : "content_ratings"}`);
    if (!details) return NO_FACTS;
    const languages = videoLanguages(details.original_language, details.spoken_languages);
    const videos = await tmdbVideos(`${base}/videos`, key, languages);
    const released = details.release_date || details.first_air_date || "";
    return {
      clamshell: clamshellFor(details.production_companies),
      genre: details.genres?.[0]?.name ?? null,
      newRelease: released !== "" && released >= oneYearAgo(),
      certification: usCertification(details),
      trailers: youtubeVideos(videos, details.original_language),
    };
  } catch {
    return NO_FACTS;
  }
}

/** How many of the latest films the /watched share image shows */
export const OG_FILMS = 3;

/**
 * A short fingerprint of what the /watched share image draws: the latest three films
 * and the details that show on their tapes. The image URL carries it as ?v=, so an
 * unchanged feed keeps the same (cached) image and a changed feed gets a new one.
 */
export function ogVersion(entries: WatchedFilm[]) {
  const source = entries
    .slice(0, OG_FILMS)
    .map((f) => [f.id, f.title, f.rating, f.poster, f.clamshell].join("|"))
    .join("\n");
  return hash(source).toString(36);
}

/** Like Promise.all over items.map(fn), with at most `limit` running at once. Keeps the order. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/**
 * Brody's Letterboxd RSS feed (the latest ~50 diary entries), cached for an hour.
 * Never throws: a failed fetch returns no entries and ok: false, so tools and the
 * share image can fall back to the profile link. Wrapped in React's cache() so a
 * page that asks twice in one render (metadata and body) reads the feed once.
 */
export const getRecentlyWatched = cache(async (): Promise<RecentlyWatched> => {
  try {
    const xml = await within(
      FEED_TIMEOUT_MS,
      "Letterboxd RSS",
      fetch(letterboxd.rss, { next: { revalidate: 3600 } }).then((res) => {
        if (!res.ok) throw new Error(`Letterboxd RSS responded ${res.status}`);
        return res.text();
      })
    );
    const feed = parser.parse(xml);
    const items: FeedItem[] = feed?.rss?.channel?.item ?? [];
    const parsed = items.map(toFilm).filter((film): film is ParsedFilm => film !== null);
    const entries = await mapLimit(parsed, TMDB_CONCURRENCY, async ({ tmdb, ...film }) => ({
      ...film,
      ...(await tmdbFacts(tmdb)),
    }));
    return { entries, profileUrl: letterboxd.profile, ok: true };
  } catch (error) {
    console.error("[letterboxd]", error);
    return { entries: [], profileUrl: letterboxd.profile, ok: false };
  }
});

/**
 * The feed for a cached page or route (/, /watched, /watched/details). Those are
 * built once and refreshed hourly in the background; if the feed is down during a
 * refresh, this throws, and Next keeps serving the last good copy instead of
 * caching "Signal lost" for the next hour. At build time there is no earlier copy
 * to keep, so the build goes ahead with the fallback (and `next dev` never throws).
 */
export async function getRecentlyWatchedForPage(): Promise<RecentlyWatched> {
  const watched = await getRecentlyWatched();
  const refreshing = process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";
  if (!watched.ok && refreshing) throw new Error("Letterboxd feed unavailable; keeping the last good copy");
  return watched;
}

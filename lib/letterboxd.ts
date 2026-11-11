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
type TmdbFacts = Pick<WatchedFilm, "clamshell" | "genre" | "newRelease" | "trailers">;

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
// "Nickelodeon Movies", "Nickelodeon Animation Studio", … (not the unrelated "Nickel Odeon")
const NICKELODEON_STUDIO = /^Nickelodeon\b/;
const NO_FACTS: TmdbFacts = { clamshell: null, genre: null, newRelease: false, trailers: [] };

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
 * A TMDB request, cached for a week. TMDB_API_KEY can be either kind of credential:
 * a v3 API key goes in the query string, a v4 read access token (a JWT) in a
 * bearer header.
 */
function tmdbFetch(path: string, key: string, query = "") {
  const bearer = key.startsWith("eyJ");
  const params = [bearer ? "" : `api_key=${key}`, query].filter(Boolean).join("&");
  return fetch(`https://api.themoviedb.org/3/${path}${params ? `?${params}` : ""}`, {
    headers: bearer ? { Authorization: `Bearer ${key}` } : undefined,
    next: { revalidate: 604800 },
  });
}

/** A film's YouTube videos, or none if the lookup fails (the rest of the tape still renders). */
async function tmdbVideos(path: string, key: string, languages: string): Promise<TmdbVideo[]> {
  try {
    const res = await tmdbFetch(path, key, `include_video_language=${languages}`);
    if (!res.ok) return [];
    const videos: { results?: TmdbVideo[] } = await res.json();
    return videos.results ?? [];
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
 * Studio, genre, and release date from TMDB, for how the tape looks on the shelf,
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
    const res = await tmdbFetch(base, key);
    if (!res.ok) return NO_FACTS;
    const details: {
      production_companies?: { name: string }[];
      genres?: { name: string }[];
      release_date?: string;
      first_air_date?: string;
      original_language?: string;
      spoken_languages?: { iso_639_1: string }[];
    } = await res.json();
    const languages = videoLanguages(details.original_language, details.spoken_languages);
    const videos = await tmdbVideos(`${base}/videos`, key, languages);
    const released = details.release_date || details.first_air_date || "";
    return {
      clamshell: clamshellFor(details.production_companies),
      genre: details.genres?.[0]?.name ?? null,
      newRelease: released !== "" && released >= oneYearAgo(),
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

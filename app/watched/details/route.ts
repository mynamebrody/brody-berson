import { getRecentlyWatchedForPage, type FilmDetailsById } from "@/lib/letterboxd";

// Same hourly restock as the pages whose tapes it fills in
export const revalidate = 3600;

/**
 * Every film's review and trailers, keyed by film id: the part of the feed only a
 * film's dialog shows. The homepage shelf and /watched fetch it once, the first
 * time someone reaches for a tape, so neither page carries it in its HTML.
 */
export async function GET() {
  // Throws while refreshing if the feed is down, so the last good details stay cached
  const { entries } = await getRecentlyWatchedForPage();
  const details: FilmDetailsById = Object.fromEntries(
    entries.map(({ id, review, trailers }) => [id, { review, trailers }])
  );
  return Response.json(details);
}

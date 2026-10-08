import { getRecentlyWatched } from "@/lib/letterboxd";

/** Paged slices of the Letterboxd feed for the homepage shelf's infinite scroll. */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const offset = Math.max(0, Number(params.get("offset")) || 0);
  const limit = Math.min(24, Math.max(1, Number(params.get("limit")) || 6));
  const { entries, profileUrl } = await getRecentlyWatched();

  return Response.json(
    {
      entries: entries.slice(offset, offset + limit),
      done: offset + limit >= entries.length,
      profileUrl,
    },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } }
  );
}

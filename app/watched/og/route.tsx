import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { NextResponse, type NextRequest } from "next/server";
import { OG_FILMS, getRecentlyWatched, ogVersion, type WatchedFilm } from "@/lib/letterboxd";

/**
 * The /watched share image: the latest three tapes under the "recently returned" sign.
 * The page links it as /watched/og?v=<fingerprint of those three films>, so a given URL
 * never changes what it shows. It's cached forever, and a changed feed means a new URL
 * and exactly one new render. A stale or missing ?v= redirects to the current one.
 */

const WIDTH = 1200;
const HEIGHT = 630;
const TAPE_W = 200;
const TAPE_H = 333;
const TAPE_TOP = 288;
const TAPE_CENTERS = [274, 594, 913];
const TILTS = [-1.2, 0.9, -0.7];

const BARS = ["#dcd8ee", "#fbe38a", "#8fdcf0", "#a5e86a", "#ff7ac0", "#ff8a70", "#b0a6e8"];
const BOARDS = ["#b48a5c", "#8f8a80", "#e4ddcc"];

// Bundled into the function via outputFileTracingIncludes in next.config.ts
const font = (file: string) => readFile(path.join(process.cwd(), "app/watched/og/fonts", file));

/** The poster inlined as a data URI, so the render doesn't depend on satori fetching it. */
async function inlinePoster(url: string | null) {
  if (!url) return null;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

/** Small stable string hash (FNV-1a), so a film always gets the same board color. */
function hash(value: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function Star({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M12 2l2.9 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.6 5.5 21.7l1.8-7.3L1.6 9.5l7.5-.6z" fill="#1c2a5e" />
    </svg>
  );
}

function Rating({ rating }: { rating: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 18,
        right: 12,
        display: "flex",
        alignItems: "center",
        gap: 2,
        height: 28,
        padding: "0 9px",
        borderRadius: 14,
        background: "#ffd23f",
        boxShadow: "0 2px 4px rgba(0,0,0,.35)",
      }}
    >
      {Array.from({ length: Math.floor(rating) }, (_, i) => (
        <Star key={i} size={14} />
      ))}
      {rating % 1 !== 0 && (
        <div style={{ display: "flex", fontFamily: "Inter", fontSize: 14, color: "#1c2a5e" }}>½</div>
      )}
    </div>
  );
}

function Tape({ film, poster, index }: { film: WatchedFilm; poster: string | null; index: number }) {
  const clamshell = film.clamshell;
  const inset = clamshell ? 8 : 0;
  const board = BOARDS[hash(film.id) % BOARDS.length];
  return (
    <div
      style={{
        position: "absolute",
        left: TAPE_CENTERS[index] - TAPE_W / 2,
        top: TAPE_TOP,
        width: TAPE_W,
        height: TAPE_H,
        display: "flex",
        padding: inset,
        transform: `rotate(${TILTS[index]}deg)`,
        boxShadow: "0 14px 22px -10px rgba(60,20,20,.55)",
        ...(clamshell
          ? {
              background:
                clamshell === "disney"
                  ? "linear-gradient(135deg, #fbf9f4, #e7e2d6 55%, #d6d0c1)"
                  : "linear-gradient(135deg, #ff9c45, #f57d0d 55%, #d96a05)",
              border: `1px solid ${clamshell === "disney" ? "#c4bcaa" : "#c45f06"}`,
              borderRadius: "0 10px 10px 0",
            }
          : { background: board, borderRadius: 2 }),
      }}
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          width={TAPE_W - inset * 2}
          height={TAPE_H - inset * 2}
          style={{ objectFit: "cover", borderRadius: 2 }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: TAPE_W - inset * 2,
            height: TAPE_H - inset * 2,
            padding: 20,
            background: "#1b1b1f",
            color: "#f4f1ea",
            fontFamily: "Antonio",
            fontSize: 38,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {film.title}
        </div>
      )}
      {film.rating ? <Rating rating={film.rating} /> : null}
    </div>
  );
}

export async function GET(request: NextRequest) {
  const { entries } = await getRecentlyWatched();
  if (!entries.length) return NextResponse.redirect(new URL("/open-graph.png", request.url), 307);

  const version = ogVersion(entries);
  if (request.nextUrl.searchParams.get("v") !== version) {
    const url = new URL(request.url);
    url.searchParams.set("v", version);
    const redirect = NextResponse.redirect(url, 307);
    redirect.headers.set("Cache-Control", "public, max-age=300");
    return redirect;
  }

  const films = entries.slice(0, OG_FILMS);
  const [antonio, vt323, inter, ...posters] = await Promise.all([
    font("Antonio-Bold.ttf"),
    font("VT323-Regular.ttf"),
    font("Inter-Bold.ttf"),
    ...films.map((film) => inlinePoster(film.poster)),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: WIDTH,
          height: HEIGHT,
          background: "linear-gradient(170deg, #f6d9cf, #f2b8b0 70%, #eea9a6)",
        }}
      >
        {/* Color bars */}
        <div style={{ position: "absolute", top: 44, left: 102, width: 996, height: 7, display: "flex", borderRadius: 4 }}>
          {BARS.map((color) => (
            <div key={color} style={{ flex: 1, background: color }} />
          ))}
        </div>

        {/* Rack behind the tapes */}
        <div
          style={{
            position: "absolute",
            top: 250,
            left: 108,
            width: 984,
            height: HEIGHT - 250,
            display: "flex",
            background: "#f5d3ca",
            borderLeft: "8px solid #e6aaa3",
            borderRight: "8px solid #e6aaa3",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 620,
            left: 100,
            width: 1000,
            height: 20,
            display: "flex",
            background: "#d99a93",
          }}
        />

        {/* Store sign */}
        <div
          style={{
            position: "absolute",
            top: 110,
            left: 102,
            width: 996,
            height: 146,
            display: "flex",
            background: "linear-gradient(160deg, #5f9d79, #3d7a58 50%, #2b6445)",
            border: "2px solid #1f4d36",
            borderRadius: 4,
            boxShadow: "0 6px 14px rgba(40,20,20,.3)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 4,
              left: 34,
              display: "flex",
              transform: "skewX(-10deg)",
              fontFamily: "Antonio",
              fontSize: 92,
              lineHeight: 1,
              color: "#ffd23f",
              textShadow: "3px 3px 0 #1d5136",
            }}
          >
            recently returned
          </div>
          <div
            style={{
              position: "absolute",
              left: 34,
              top: 108,
              display: "flex",
              fontFamily: "Inter",
              fontSize: 20,
              color: "#ffffff",
              transform: "skewX(-10deg)",
            }}
          >
            If you don’t enjoy it, try another FREE
          </div>
          <div
            style={{
              position: "absolute",
              top: 34,
              right: 34,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              background: "#ffd23f",
              color: "#1c2a5e",
              transform: "rotate(1.5deg)",
              boxShadow: "0 3px 6px rgba(0,0,0,.3)",
            }}
          >
            <div style={{ display: "flex", fontFamily: "Antonio", fontSize: 52, lineHeight: 1 }}>$1</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontFamily: "Antonio", fontSize: 24, lineHeight: 1 }}>EACH</div>
              <div style={{ display: "flex", fontFamily: "VT323", fontSize: 18, lineHeight: 1 }}>5 NIGHTS</div>
            </div>
          </div>
        </div>

        {films.map((film, i) => (
          <Tape key={film.id} film={film} poster={posters[i]} index={i} />
        ))}
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Antonio", data: antonio, weight: 700, style: "normal" },
        { name: "VT323", data: vt323, weight: 400, style: "normal" },
        { name: "Inter", data: inter, weight: 700, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    }
  );
}

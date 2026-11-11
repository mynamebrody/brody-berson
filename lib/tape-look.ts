/**
 * How a rental tape looks, worked out from the film alone: board stock, wear,
 * stickers and where they land. No React here, so server components, the client
 * tape, and the /watched share image can all use the same rules.
 */
import type { WatchedFilm } from "@/lib/letterboxd";

/** Everything that can happen to a rental box after a few hundred trips home. */
const slipcaseWear = [
  "sunFaded",
  "edgeworn",
  "edgeChipped",
  "cornersRubbed",
  "shelfScuffed",
  "dogEared",
  "torn",
  "crushedCorner",
  "creased",
  "waterStain",
  "residue",
  "scratched",
  "grimy",
  "peeling",
  "splitSeam",
  "foxing",
  "spineCrack",
] as const;
type Wear = (typeof slipcaseWear)[number];
/** A clamshell protects the paper insert, so only some damage gets through the plastic. */
const clamshellWear: readonly Wear[] = ["sunFaded", "dogEared", "creased", "residue", "scratched", "grimy", "foxing"];
/** At most one from each group per tape: the members pile up on the same edges and corners. */
const exclusiveWear: readonly (readonly Wear[])[] = [
  ["torn", "dogEared", "crushedCorner"],
  ["edgeworn", "edgeChipped", "cornersRubbed", "shelfScuffed"],
  ["splitSeam", "spineCrack"],
];
/** Board the slipcase is printed on: what shows through where the print is worn off. */
const stocks = ["kraft", "chipboard", "bleached"] as const;
export const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** New Release stickers are color-coded by genre, like the shelf dots at a rental store. */
const genreColors: [RegExp, string, string][] = [
  [/horror/i, "#b3121b", "#ffffff"],
  [/thriller|crime|mystery/i, "#5b2a86", "#ffffff"],
  [/comedy/i, "#ffd23f", "#1a1a1a"],
  [/action|adventure|war|western/i, "#ff6a13", "#ffffff"],
  [/romance/i, "#ff5fa2", "#ffffff"],
  [/science fiction|sci-fi|fantasy/i, "#16a3a3", "#ffffff"],
  [/animation|family|kids/i, "#3bb54a", "#ffffff"],
  [/documentary|music|history/i, "#c98a1a", "#ffffff"],
  [/drama/i, "#2f62d8", "#ffffff"],
];
const defaultGenreColor = ["#e8392f", "#ffffff"];

function genreColor(genre: string | null) {
  const match = genre ? genreColors.find(([pattern]) => pattern.test(genre)) : undefined;
  return match ? [match[1], match[2]] : defaultGenreColor;
}

/** What the store calls a section when TMDB's name for the genre is too long for the strip. */
const sectionNames: Record<string, string> = {
  "Science Fiction": "Sci-Fi",
  "Sci-Fi & Fantasy": "Sci-Fi",
  "Action & Adventure": "Action",
  "War & Politics": "War",
};

/** Previously Viewed stickers came off whatever roll was at the counter. */
const pvShapes = ["burst", "round", "scallop", "oval"] as const;
const pvColors = [
  ["#ff5a1f", "#fff8e6"],
  ["#e8392f", "#ffffff"],
  ["#ffd23f", "#1a1a1a"],
  ["#8ee04a", "#10240a"],
  ["#2f62d8", "#ffffff"],
];

/** Small stable string hash (FNV-1a) so a film always gets the same look. */
export function hash(value: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** An upright-enough tilt, so a sticker always stays readable: -max…+max degrees. */
const turn = (h: number, max: number) => `${(h % (max * 2 + 1)) - max}deg`;
/** A percentage between min and max. */
const between = (h: number, min: number, max: number) => min + (h % (max - min + 1));

export type TapePlan = {
  stock: (typeof stocks)[number];
  wear: Wear[];
  rewind: boolean;
  label: boolean;
  /** A strip on the spine edge naming the section of the store the tape is shelved in (its genre) */
  section: boolean;
};

/** Two or three kinds of wear, none of them shared with the tape before it. */
function pickWear(film: Pick<WatchedFilm, "id" | "clamshell">, prev: Wear[]) {
  const pool = (film.clamshell ? clamshellWear : slipcaseWear).filter((w) => !prev.includes(w));
  const ranked = pool
    .map((w) => [w, hash(`${film.id}:${w}`)] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([w]) => w);
  const count = 2 + ((hash(film.id) >>> 5) % 2);
  const picked: Wear[] = [];
  for (const w of ranked) {
    if (picked.length === count) break;
    if (exclusiveWear.some((group) => group.includes(w) && picked.some((p) => group.includes(p)))) continue;
    picked.push(w);
  }
  return picked;
}

/**
 * The shelf's look, tape by tape: board stock and wear never repeat between
 * neighbors; "Be kind rewind" stickers and BBTV Video store labels each land on
 * roughly one in three, never two in a row; section strips on about as many, and
 * never on a tape with a rewind sticker. Depends only on earlier films, so
 * tapes already on the shelf keep their look as more load in.
 */
export function shelfPlan(films: Pick<WatchedFilm, "id" | "clamshell" | "genre">[]) {
  const plan: TapePlan[] = [];
  films.forEach((film, i) => {
    const h = hash(film.id);
    const prev = plan[i - 1];
    let stock = stocks[(h >>> 26) % stocks.length];
    if (stock === prev?.stock) stock = stocks[((h >>> 26) + 1) % stocks.length];
    const rewind = !prev?.rewind && h % 3 === 0;
    plan.push({
      stock,
      wear: pickWear(film, prev?.wear ?? []),
      rewind,
      label: !prev?.label && (h >>> 3) % 3 === 1,
      // Shares the left edge with the rewind sticker, so a tape gets one or the other
      section: Boolean(film.genre) && !rewind && !prev?.section && (h >>> 7) % 5 < 2,
    });
  });
  return plan;
}

/**
 * Tilt, the price sticker, and where each sticker and bit of damage lands come
 * from the film's id, so they're stable across renders and reloads. Each sticker
 * stays in its own zone of the box: New Release top left, rating or price top
 * right, rewind in the upper middle, the section strip on the left edge below
 * it, Staff Pick bottom left, the store label and Previously Viewed bottom right
 * (Previously Viewed stacks above the label). What is printed on the box rather
 * than stuck to it (the Letterbox Edition band, the classification) sits square.
 */
export function variant(film: Pick<WatchedFilm, "id" | "genre">, plan: TapePlan) {
  const h = hash(film.id);
  const a = hash(`${film.id}:fx`);
  const b = hash(`${film.id}:fx2`);
  const c = hash(`${film.id}:fx3`);
  const k = hash(`${film.id}:crease`);
  const s1 = hash(`${film.id}:sticker`);
  const s2 = hash(`${film.id}:sticker2`);
  const s3 = hash(`${film.id}:sticker3`);
  const [nrBg, nrInk] = genreColor(film.genre);
  const [pvBg, pvInk] = pvColors[(s3 >>> 20) % pvColors.length];
  const labelBottom = between(s2 >>> 18, 3, 8);
  return {
    tilt: (((h >>> 12) % 7) - 3) * 0.5,
    price: (h >>> 22) % 5 === 1,
    earLeft: (a >>> 25) % 2 === 1,
    pvShape: pvShapes[(s3 >>> 26) % pvShapes.length],
    stockNo: String((c >>> 3) % 100000).padStart(5, "0"),
    section: plan.section && film.genre ? (sectionNames[film.genre] ?? film.genre) : null,
    stickersAt: {
      ...(plan.section
        ? { "--section-top": `${between(s3 >>> 14, 35, 40)}%`, "--section-turn": turn(s1 >>> 26, 2) }
        : null),
      "--nr-top": `${between(s1, 2, 10)}%`,
      "--nr-left": `${between(s1 >>> 4, 2, 12)}%`,
      "--nr-turn": turn(s1 >>> 8, 12),
      "--nr-bg": nrBg,
      "--nr-ink": nrInk,
      "--rating-top": `${between(s1 >>> 13, 2, 7)}%`,
      "--rating-right": `${between(s1 >>> 17, 3, 9)}%`,
      "--rating-turn": turn(s1 >>> 21, 9),
      "--rewind-top": `${between(h >>> 14, 26, 48)}%`,
      "--rewind-left": `${between(h >>> 19, 6, 40)}%`,
      "--rewind-turn": turn(h >>> 24, 12),
      "--staff-bottom": `${between(s2, 3, 11)}%`,
      "--staff-left": `${between(s2 >>> 4, 3, 10)}%`,
      "--staff-turn": turn(s2 >>> 8, 12),
      "--label-bottom": `${labelBottom}%`,
      "--label-right": `${between(s2 >>> 22, 3, 9)}%`,
      "--label-turn": turn(s2 >>> 26, 5),
      // Just above the store label when there is one, otherwise anywhere low on the right
      "--pv-bottom": plan.label ? `calc(${labelBottom}% + 30px)` : `${between(s3, 3, 13)}%`,
      "--pv-right": `${between(s3 >>> 5, 3, 14)}%`,
      "--pv-turn": turn(s3 >>> 10, 12),
      "--pv-bg": pvBg,
      "--pv-ink": pvInk,
    },
    // Placement for whichever wear the tape ended up with
    wearAt: {
      "--fade-angle": `${[90, 180, 270, 0][a % 4]}deg`,
      "--ear": `${22 + ((a >>> 2) % 14)}px`,
      "--crease-flip": (a >>> 6) % 2 ? 1 : -1,
      "--stain-x": `${15 + ((a >>> 7) % 65)}%`,
      "--stain-y": `${18 + ((a >>> 13) % 60)}%`,
      "--stain-r": `${18 + ((a >>> 19) % 18)}px`,
      "--residue-x": `${8 + (b % 46)}%`,
      "--residue-y": `${10 + ((b >>> 6) % 70)}%`,
      "--residue-turn": `${((b >>> 13) % 31) - 15}deg`,
      "--scratch-angle": `${[35, 58, 122, 145][(b >>> 18) % 4] + ((b >>> 20) % 12)}deg`,
      "--flip": (b >>> 24) % 2 ? 1 : -1,
      "--seam-y": `${10 + ((b >>> 25) % 45)}%`,
      "--fox-x": `${20 + ((c >>> 1) % 60)}%`,
      "--fox-y": `${20 + ((c >>> 7) % 60)}%`,
      "--spine-x": `${5 + ((c >>> 27) % 4)}%`,
      // Creases: a mostly-vertical fold, a mostly-horizontal one, and a stray diagonal,
      // each somewhere different (and some fainter or missing) on every tape
      "--c1-angle": `${80 + (k % 31)}deg`,
      "--c1-pos": `${18 + ((k >>> 5) % 65)}%`,
      "--c2-angle": `${-14 + ((k >>> 11) % 29)}deg`,
      "--c2-pos": `${15 + ((k >>> 16) % 70)}%`,
      "--c2-alpha": [0, 0.6, 0.85, 1][(k >>> 21) % 4],
      "--c3-angle": `${20 + ((k >>> 23) % 140)}deg`,
      "--c3-pos": `${15 + ((c >>> 14) % 70)}%`,
      "--c3-alpha": [0, 0.5, 0.8, 1][(c >>> 22) % 4],
    },
  };
}

export function stars(rating: number | null) {
  if (rating === null) return null;
  return "★".repeat(Math.floor(rating)) + (rating % 1 ? "½" : "");
}

/** "2026-10-06" → "OCT 06 2026", without going through Date (no timezone drift). */
export function watchedOn(date: string) {
  const [year, month, day] = date.split("-");
  return year && month && day ? `${months[Number(month) - 1]} ${day} ${year}` : date;
}

/** The size Letterboxd's feed links: 600 wide, 2:3. */
const POSTER_SIZE = /-0-600-0-900-crop(?=\.jpg)/;
/** Other widths its CDN serves for every poster. (400 is refused for about half of them.) */
const POSTER_WIDTHS = [300, 460, 600];

/**
 * The same poster at each width Letterboxd serves, for srcset, so a small tape
 * doesn't download the 600px file. Undefined when the URL isn't the pattern we
 * know, which leaves the plain src to do the job.
 */
export function posterSrcSet(url: string) {
  if (!POSTER_SIZE.test(url)) return undefined;
  return POSTER_WIDTHS.map((w) => `${url.replace(POSTER_SIZE, `-0-${w}-0-${w * 1.5}-crop`)} ${w}w`).join(", ");
}

/**
 * How wide a tape's poster is drawn, for the sizes attribute. Approximate on
 * purpose: the wall's columns flex, and the browser only needs the right
 * neighbourhood to pick a file.
 */
export const posterSizes = {
  shelf: "(min-width: 640px) 192px, 176px",
  wall: "(min-width: 1024px) 130px, (min-width: 480px) 160px, calc(50vw - 56px)",
  lead: "(min-width: 1024px) 198px, (min-width: 480px) 160px, calc(50vw - 56px)",
  /** The poster in the film dialog (hidden on phones) */
  dialog: "144px",
} as const;

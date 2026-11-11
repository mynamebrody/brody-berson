import { tapeFilm, type WatchedFilm } from "@/lib/letterboxd";
import { shelfPlan } from "@/lib/tape-look";
import { FilmDialogHost } from "./vhs/film-dialog-host";
import { ShelfScroller } from "./vhs/shelf-scroller";
import { EndOfTape, VhsTape } from "./vhs/tape";

type Props = {
  films: WatchedFilm[];
  profileUrl: string;
};

/**
 * Horizontal video-store shelf of the latest Letterboxd watches on the homepage.
 * It holds a fixed handful; a blank tape at the end hands off to /watched, which
 * has the whole feed.
 */
export function WatchingShelf({ films, profileUrl }: Props) {
  if (films.length === 0) {
    return (
      <div className="mt-8 flex">
        <EndOfTape href={profileUrl} note="Signal lost" label="Catch it on" />
      </div>
    );
  }

  // The tapes and the dialog host share these slim objects; reviews and trailers
  // are fetched from /watched/details when a tape is first reached for
  const tapes = films.map((film) => tapeFilm(film, { excerpt: true }));
  const plan = shelfPlan(tapes);

  return (
    <FilmDialogHost films={tapes}>
      <ShelfScroller>
        {tapes.map((film, index) => (
          <VhsTape key={film.id} film={film} plan={plan[index]} />
        ))}
        <EndOfTape href="/watched" note="End of tape" label="See the whole shelf" target="/watched →" />
      </ShelfScroller>
    </FilmDialogHost>
  );
}

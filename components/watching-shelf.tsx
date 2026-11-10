import type { WatchedFilm } from "@/lib/letterboxd";
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

  const plan = shelfPlan(films);

  return (
    <FilmDialogHost films={films}>
      <ShelfScroller>
        {films.map((film, index) => (
          <VhsTape key={film.id} film={film} plan={plan[index]} />
        ))}
        <EndOfTape href="/watched" note="End of tape" label="See the whole shelf" target="/watched →" />
      </ShelfScroller>
    </FilmDialogHost>
  );
}

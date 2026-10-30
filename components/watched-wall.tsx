"use client";

import type { WatchedFilm } from "@/lib/letterboxd";
import { EndOfTape, shelfPlan, VhsTape } from "./vhs-tape";
import styles from "./watched-wall.module.css";

/** How many of the latest films get the rack's first shelf to themselves. */
const FIRST_SHELF = 3;

type Props = {
  films: WatchedFilm[];
  profileUrl: string;
};

/**
 * The /watched video store: the whole feed packed face-out onto a back-wall rack
 * under the store sign, newest first. The latest three get the first shelf, bigger
 * and with more room between them. The shelf plan runs over the whole feed, so
 * every tape wears exactly what it does on the homepage shelf.
 */
export function WatchedWall({ films, profileUrl }: Props) {
  if (films.length === 0) {
    return (
      <div className="mt-12 flex pb-24">
        <EndOfTape href={profileUrl} note="Signal lost" label="Catch it on" />
      </div>
    );
  }

  const plan = shelfPlan(films);

  return (
    <section aria-labelledby="wall-title" className="pt-14 pb-24">
      <div className={styles.sign}>
        <div>
          <h2 id="wall-title" className={styles.signTitle}>
            recently returned
          </h2>
          <p className={styles.signTagline}>If you don&rsquo;t enjoy it, try another FREE</p>
        </div>
        <p className={styles.price} aria-hidden="true">
          <span className={styles.priceAmount}>$1</span>
          <span className={styles.priceEach}>Each</span>
          <span className={styles.priceTerms}>5 nights</span>
        </p>
      </div>
      <div className={styles.rack}>
        <div className={styles.shelves}>
          <div className={styles.firstShelf}>
            {films.slice(0, FIRST_SHELF).map((film, index) => (
              <VhsTape key={film.id} film={film} plan={plan[index]} size="lead" />
            ))}
          </div>
          {films.slice(FIRST_SHELF).map((film, index) => (
            <VhsTape key={film.id} film={film} plan={plan[index + FIRST_SHELF]} size="wall" />
          ))}
          <EndOfTape href={profileUrl} note="End of tape" label="See it all on" wall />
        </div>
      </div>
      <div className={styles.base} aria-hidden="true">
        <span className={styles.nameplate}>BBTV Video</span>
      </div>
    </section>
  );
}

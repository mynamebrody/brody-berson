import type { FilmDetailsById } from "@/lib/letterboxd";

let request: Promise<FilmDetailsById> | null = null;

/**
 * Reviews and trailers for every film on the shelf, in one request shared by
 * every caller on the page. A failed request is forgotten, so the next tape
 * someone reaches for tries again.
 */
export function loadFilmDetails() {
  request ??= fetch("/watched/details")
    .then((res) => {
      if (!res.ok) throw new Error(`Film details responded ${res.status}`);
      return res.json() as Promise<FilmDetailsById>;
    })
    .catch((error) => {
      request = null;
      throw error;
    });
  return request;
}

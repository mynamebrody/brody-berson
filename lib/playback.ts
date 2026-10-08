/**
 * Site-wide Play/Pause for the broadcast effects. State lives on
 * <html data-playback="playing|paused">, set before first paint by the init
 * script in app/layout.tsx; CSS keyed off that attribute does the freezing.
 */
export type Playback = "playing" | "paused";

export function getPlayback(): Playback {
  return document.documentElement.dataset.playback === "paused" ? "paused" : "playing";
}

export function setPlayback(next: Playback) {
  document.documentElement.dataset.playback = next;
  try {
    if (next === "paused") {
      localStorage.setItem("playback", "paused");
    } else {
      localStorage.removeItem("playback");
    }
  } catch {
    // localStorage unavailable; the choice still applies for this page view
  }
}

/** Notify on changes to the data-playback attribute (for useSyncExternalStore). */
export function subscribePlayback(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-playback"] });
  return () => observer.disconnect();
}

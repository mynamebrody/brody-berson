import styles from "./broadcast-fx.module.css";

/**
 * The full-viewport texture itself: grain, scanlines, light leaks, and tube corners.
 * Also rendered inside modal dialogs, which sit in the browser's top layer above
 * the page-level copy.
 */
export function BroadcastTexture() {
  return (
    <div className={styles.root} aria-hidden="true">
      <div className={styles.grain} />
      <div className={styles.scanlines} />
      <div className={`${styles.leak} ${styles.leakWarm}`} />
      <div className={`${styles.leak} ${styles.leakCool}`} />
      <div className={styles.shafts} />
      <div className={styles.flicker} />
      <div className={styles.lift} />
      <div className={styles.vignette} />
      <div className={styles.tube} />
    </div>
  );
}

/**
 * Site-wide broadcast texture layered over every page, plus the CRT power-on
 * and the VHS pause screen. Purely decorative.
 */
export function BroadcastFx() {
  return (
    <>
      <BroadcastTexture />
      <div className={styles.power} aria-hidden="true">
        <div className={styles.powerLine} />
      </div>
      {/* VHS pause screen, shown while the site is paused (data-playback="paused") */}
      <div className={styles.pause} aria-hidden="true">
        <p className={styles.pauseLabel}>Pause</p>
        <div className={styles.pauseBand} />
      </div>
    </>
  );
}

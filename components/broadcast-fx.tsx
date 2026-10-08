import styles from "./broadcast-fx.module.css";

/**
 * Site-wide broadcast texture layered over every page: grain, scanlines,
 * light leaks, and tube corners. Purely decorative.
 */
export function BroadcastFx() {
  return (
    <>
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
      <div className={styles.power} aria-hidden="true">
        <div className={styles.powerLine} />
      </div>
    </>
  );
}

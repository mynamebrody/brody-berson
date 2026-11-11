import type { Metadata } from "next";
import Link from "next/link";
import { LostPath } from "@/components/lost-path";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { pages } from "@/content/site";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "404 · Tape Not Found",
};

const channels = [pages.home, pages.watched, pages.resume];

/** One of the two boxes in the product shot. Decorative: the copy beside it says everything. */
function Tape({ volume, second = false }: { volume: number; second?: boolean }) {
  return (
    <span className={`${styles.stage} ${second ? styles.stageTwo : ""}`}>
      <span className={styles.box}>
        <span className={styles.spine}>
          <span className={styles.spineLogo}>BB</span>
          <span className={styles.spineTitle}>Page Not Found</span>
          <span className={styles.spineSticker}>
            D<br />4<br />0<br />4
          </span>
          <span className={styles.wear} />
        </span>
        <span className={styles.front}>
          <span className={styles.rating}>
            <b>NF</b>
            <span>Not found. Viewer discretion advised.</span>
          </span>
          <span className={styles.window}>
            <span className={styles.still}>404</span>
          </span>
          <span className={styles.titles}>
            <span className={styles.tapeTitle}>Page Not Found</span>
            <span className={styles.tapeVolume}>Volume {volume === 1 ? "One" : "Two"}</span>
            <span className={styles.credits}>
              BBTV Home Video presents &ldquo;Page Not Found&rdquo; · Starring a link that went nowhere
            </span>
            <span className={styles.badges}>
              <span className={styles.vhs}>
                VHS<small>Format</small>
              </span>
              <span className={styles.logo}>BBTV Video</span>
            </span>
          </span>
          <span className={styles.rental}>
            D<br />
            {volume}
          </span>
          <span className={styles.taped}>D40{volume}</span>
          {second ? (
            <span className={styles.burst}>
              Not sold
              <br />
              in stores
            </span>
          ) : null}
          <span className={styles.wear} />
        </span>
      </span>
    </span>
  );
}

/**
 * The 404 page: the end card of a late-night infomercial, on the blue screen of a
 * worn tape. Same blue in Daytime and Primetime; it's a recording, not a themed page.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main id="main" tabIndex={-1} className={styles.page}>
        <div className={styles.band} aria-hidden="true" />
        <div className={styles.noise} aria-hidden="true" />

        <div className={styles.card}>
          <div className={styles.product} aria-hidden="true">
            <div className={styles.tapes}>
              <Tape volume={1} />
              <Tape volume={2} second />
            </div>
            <div className={styles.cards}>
              <span>404</span>
              <span>Lost</span>
              <span>Void</span>
            </div>
          </div>

          <div className={styles.copy}>
            <h1 className={styles.title}>Page Not Found Videos</h1>
            <p className={styles.price}>
              <span className={styles.dollar}>$</span>4.04
            </p>
            <p className={styles.fine}>Plus $4.04 Shipping &amp; Handling</p>

            <p className={styles.label}>No tape on file for:</p>
            <p className={styles.path}>
              <LostPath />
            </p>

            <p className={styles.label}>Or tune back in to:</p>
            <nav className={styles.nav} aria-label="Pages that exist">
              {channels.map((channel) => (
                <Link key={channel.path} href={channel.path}>
                  {channel.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.cta}>
            <Link href="/" className={styles.phone} aria-label="Call 404-IAM-LOST: back to the home page">
              Call 404-IAM-LOST
            </Link>
            <p className={styles.fine}>
              <span className="rec-blink">Operators are standing by</span> · Page not included · 30 day money back
              guarantee
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

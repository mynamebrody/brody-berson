import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { linkHub, site, socialLinks } from "@/content/site";
import styles from "./links.module.css";

type SocialIconName = (typeof linkHub.socialLabels)[number];

const linkHubSocials = linkHub.socialLabels.flatMap((label) => {
  const socialLink = socialLinks.find((link) => link.label === label);
  return socialLink ? [{ ...socialLink, label }] : [];
});

export const metadata: Metadata = {
  title: "Links",
  description: `Find ${site.name} around the web.`,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

function SocialIcon({ name }: { name: SocialIconName }) {
  if (name === "Threads") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z" />
      </svg>
    );
  }

  if (name === "Instagram") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      </svg>
    );
  }

  if (name === "Letterboxd") {
    // Geometry from the official decal (a.ltrbxd.com/logos/letterboxd-decal-dots-neg-mono.svg):
    // three dots with lens-shaped gaps where they overlap.
    return (
      <svg aria-hidden="true" viewBox="61 61 378 378">
        <defs>
          <mask id="letterboxd-gaps">
            <rect x="61" y="61" width="378" height="378" fill="#fff" />
            <path
              d="M190.54 287.06C183.81 276.31 179.92 263.61 179.92 250s3.89-26.31 10.62-37.06c6.73 10.75 10.62 23.45 10.62 37.06s-3.89 26.31-10.62 37.06Z"
              fill="#000"
            />
            <path
              d="M309.46 212.94c6.73 10.75 10.62 23.45 10.62 37.06s-3.89 26.31-10.62 37.06c-6.73-10.75-10.62-23.45-10.62-37.06s3.89-26.31 10.62-37.06Z"
              fill="#000"
            />
          </mask>
        </defs>
        <g mask="url(#letterboxd-gaps)">
          <ellipse cx="131.08" cy="250" rx="70.08" ry="70" />
          <ellipse cx="250" cy="250" rx="70.08" ry="70" />
          <ellipse cx="368.92" cy="250" rx="70.08" ry="70" />
        </g>
      </svg>
    );
  }

  if (name === "LinkedIn") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.51 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.84L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  );
}

export default function LinksPage() {
  return (
    <main className={styles.page}>
      <section className={styles.content} aria-labelledby="links-heading">
        <div className={styles.avatarFrame}>
          <Image
            src="/memoji.png"
            alt={`${site.name}'s memoji`}
            width={136}
            height={136}
            priority
            sizes="136px"
            className={styles.avatar}
          />
        </div>

        <h1 id="links-heading" className={styles.name}>
          {site.name}
        </h1>
        <p className={styles.bio}>
          {linkHub.bio.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>

        <ul className={styles.socialList} aria-label="Social media">
          {linkHubSocials.map((socialLink) => {
            const displayName = socialLink.label === "Twitter" ? "X" : socialLink.label;
            return (
              <li key={socialLink.label}>
                <a
                  href={socialLink.url}
                  aria-label={`${site.name} on ${displayName}`}
                  title={displayName}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.socialLink}
                >
                  <SocialIcon name={socialLink.label} />
                </a>
              </li>
            );
          })}
        </ul>

        <div className={styles.buttonList}>
          {linkHub.primaryLinks.map((primaryLink, index) => {
            const isExternal =
              primaryLink.url.startsWith("http") && primaryLink.url !== site.url;
            const href = primaryLink.url === site.url ? "/" : primaryLink.url;
            const buttonContent = (
              <>
                <span>{primaryLink.label}</span>
                <span className={styles.arrow} aria-hidden="true">
                  {isExternal ? "↗" : "→"}
                </span>
              </>
            );

            const buttonClass =
              index === 0 ? `${styles.linkButton} ${styles.linkButtonPrimary}` : styles.linkButton;

            return isExternal ? (
              <a
                key={primaryLink.label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={buttonClass}
              >
                {buttonContent}
              </a>
            ) : (
              <Link key={primaryLink.label} href={href} className={buttonClass}>
                {buttonContent}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

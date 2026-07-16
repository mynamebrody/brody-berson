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
  if (name === "Instagram") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      </svg>
    );
  }

  if (name === "YouTube") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
      </svg>
    );
  }

  if (name === "TikTok") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M15.6 2c.3 2.6 1.7 4.2 4.4 4.4v3a10.2 10.2 0 0 1-4.4-1v6.1a7.4 7.4 0 1 1-6.4-7.3v3.2a4.3 4.3 0 1 0 3.4 4.2V2h3Z" />
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
          {linkHubSocials.map((socialLink) => (
            <li key={socialLink.label}>
              <a
                href={socialLink.url}
                aria-label={`${site.name} on ${socialLink.label}`}
                title={socialLink.label}
                target="_blank"
                rel="noreferrer"
                className={styles.socialLink}
              >
                <SocialIcon name={socialLink.label} />
              </a>
            </li>
          ))}
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

            return isExternal ? (
              <a
                key={primaryLink.label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={styles.linkButton}
                data-tone={(index % 3) + 1}
              >
                {buttonContent}
              </a>
            ) : (
              <Link
                key={primaryLink.label}
                href={href}
                className={styles.linkButton}
                data-tone={(index % 3) + 1}
              >
                {buttonContent}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

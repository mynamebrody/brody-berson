import Link from "next/link";
import { ColorBars } from "@/components/color-bars";
import { CrtPortrait } from "@/components/crt-portrait";
import { McpCard } from "@/components/mcp-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WatchingShelf } from "@/components/watching-shelf";
import { resume } from "@/content/resume";
import { home, letterboxd, personal, site, type Inline } from "@/content/site";
import { getRecentlyWatchedForPage } from "@/lib/letterboxd";

// The Letterboxd shelf refreshes hourly; everything else is static content
export const revalidate = 3600;

const currentJob = resume.work[0];

// Chapters run oldest to newest, so the latest project is the last chapter.
// resume.projects is newest-first; a stable sort by year keeps same-year
// projects in their original (release) order.
const chapters = [...resume.projects].sort((a, b) => Number(a.year ?? 0) - Number(b.year ?? 0));

// Chapter thumbnails cycle through the pastel set
const chapterColors = ["var(--pop)", "var(--zest)", "var(--peri)", "var(--tang)"];

function slotYear(date: string) {
  return date === "Present" ? "Now" : date.slice(-4);
}

/** Copy from content/ with its links, each drawn in the paragraph's own link style. */
function Copy({ parts, linkClassName }: { parts: Inline[]; linkClassName: string }) {
  return parts.map((part) =>
    typeof part === "string" ? (
      part
    ) : (
      <a key={part.url} href={part.url} className={linkClassName}>
        {part.text}
      </a>
    ),
  );
}

const textLink =
  "font-medium text-ink underline decoration-pop decoration-2 underline-offset-4 hover:text-glow";

function StatusCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <article className="overflow-hidden rounded-xl border border-line bg-surface">
      <h3
        className="scanlines osd relative flex h-12 items-end px-5 pb-1.5 text-xl font-normal text-deep"
        style={{ backgroundColor: color }}
      >
        {title}
      </h3>
      <div className="p-6">{children}</div>
    </article>
  );
}

function StatusRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="osd text-base text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-sm leading-relaxed text-ink-soft">{children}</dd>
    </div>
  );
}

// The homepage shelf holds the latest dozen; /watched has the whole feed
const SHELF_SIZE = 12;

export default async function Home() {
  const watched = await getRecentlyWatchedForPage();

  return (
    <>
      <SiteHeader current="home" sticky />

      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-5 outline-none sm:px-8">
        {/* Hero: title card */}
        {/* Phones: the portrait sits beside the title. From sm up it is the right-hand column. */}
        <section className="grid grid-cols-[1fr_auto] items-center gap-x-4 pt-14 pb-20 sm:gap-x-12 sm:pt-20 sm:pb-24">
          <p className="osd fade-up col-span-2 text-xl text-balance text-ink-faint sm:col-span-1">
            ▶ Now playing · {site.location}
          </p>
          <h1
            className="title-glow fade-up col-start-1 mt-3 font-display text-7xl leading-[0.9] font-semibold tracking-wide uppercase max-[359px]:text-6xl sm:text-8xl"
            style={{ animationDelay: "60ms" }}
          >
            Hi, I&rsquo;m {site.firstName}.
          </h1>
          <div
            className="fade-up col-start-2 row-start-2 justify-self-center max-sm:mt-3 sm:row-span-3 sm:row-start-1"
            style={{ animationDelay: "150ms" }}
          >
            <CrtPortrait size={240} smallSize={104} alt="Brody's memoji" priority />
          </div>
          <div className="col-span-2 sm:col-span-1 sm:col-start-1">
            {/* Lower third */}
            <div
              className="fade-up mt-6 inline-flex max-w-full items-stretch overflow-hidden rounded-md shadow-[0_10px_24px_-14px_var(--signal)]"
              style={{ animationDelay: "100ms" }}
            >
              <span className="gloss gloss-pop osd flex items-center rounded-none border-0 px-2.5 text-lg">
                Live
              </span>
              <span className="gloss font-display flex items-center rounded-none border-0 px-4 py-1.5 text-base tracking-wider uppercase sm:text-xl">
                {currentJob.position} · {currentJob.company}
              </span>
            </div>
            <p
              className="fade-up mt-6 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl"
              style={{ animationDelay: "120ms" }}
            >
              <Copy parts={home.hero.lead} linkClassName="marker font-medium text-ink" />
            </p>
            <p
              className="fade-up mt-4 max-w-xl leading-relaxed text-ink-soft"
              style={{ animationDelay: "180ms" }}
            >
              <Copy
                parts={home.hero.aside}
                linkClassName={textLink}
              />
            </p>
            <div className="fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
              <Link href="/resume" className="gloss rounded-full px-6 py-2.5 text-sm font-semibold">
                View resume
              </Link>
              <a
                href="#mcp"
                className="osd rounded-full border border-line bg-screen-2/70 px-5 py-1.5 text-lg text-ink-soft transition-colors hover:border-glow hover:text-glow"
              >
                Connect your agent ↓
              </a>
            </div>
          </div>
        </section>

        <ColorBars />

        {/* MCP */}
        <section id="mcp" className="scroll-mt-24 pt-16 pb-20">
          <p className="osd text-xl text-ink-faint">CH 03 · For your agent</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-wide uppercase sm:text-5xl">
            This site speaks <span className="marker">MCP</span>.
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
            My personal site ships its own Model Context Protocol server. Add it to Claude
            Desktop, Cursor, or any MCP client, and your AI can query my resume, projects, and
            contact info directly. No API keys, no auth, just the URL.
          </p>
          <div className="mt-8">
            <McpCard />
          </div>
          <p className="osd mt-4 text-base text-ink-faint normal-case">
            Prefer plain files? <a href="/AGENTS.md" className="underline underline-offset-4 hover:text-glow">AGENTS.md</a> ·{" "}
            <a href="/llms.txt" className="underline underline-offset-4 hover:text-glow">llms.txt</a> ·{" "}
            <a href="/mcp/server-card" className="underline underline-offset-4 hover:text-glow">server card</a>
          </p>
        </section>

        <ColorBars />

        {/* Career: TV guide */}
        <section className="pt-16 pb-20">
          <p className="osd text-xl text-ink-faint">CH 20 · Where I&rsquo;ve been</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-wide uppercase sm:text-5xl">
            A decade of <span className="marker">APIs</span>, integrations, and partners.
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
            {home.career}
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-line bg-surface">
            <div className="osd hidden grid-cols-[8rem_12rem_1fr] gap-4 border-b border-line bg-signal px-5 py-1.5 text-lg text-white sm:grid">
              <span>Time</span>
              <span>Program</span>
              <span>Episode</span>
            </div>
            <ol>
              {resume.work.map((job) => (
                <li
                  key={`${job.company}-${job.startDate}`}
                  className="grid gap-x-4 gap-y-0.5 border-b border-line/70 px-5 py-3 last:border-b-0 even:bg-screen-2/50 sm:grid-cols-[8rem_12rem_1fr] sm:items-baseline"
                >
                  <span className="osd text-lg text-ink-faint tabular-nums">
                    {slotYear(job.startDate)}–{slotYear(job.endDate)}
                  </span>
                  <span className="flex items-baseline gap-2 font-display text-xl tracking-wide uppercase">
                    {job.company}
                    {job.endDate === "Present" ? (
                      <span className="osd rounded-sm bg-zest px-1.5 text-sm text-deep">On now</span>
                    ) : null}
                  </span>
                  <span className="text-sm text-ink-soft">{job.position}</span>
                </li>
              ))}
            </ol>
          </div>
          <Link href="/resume" className="gloss mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold">
            View the full resume →
          </Link>
        </section>

        <ColorBars />

        {/* Projects: DVD chapter select */}
        <section className="pt-16 pb-20">
          <p className="osd text-xl text-ink-faint">CH 67 · Side quests</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-wide uppercase sm:text-5xl">
            Things built for the <span className="marker">fun</span> of it.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {chapters.map((project, index) => (
              <article
                key={project.name}
                className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-shadow hover:shadow-[0_0_0_2px_var(--glow),0_0_32px_-6px_var(--glow)]"
              >
                <div
                  className="scanlines relative flex h-20 items-end justify-between px-5 pb-2 text-deep"
                  style={{ backgroundColor: chapterColors[index % chapterColors.length] }}
                >
                  <span className="osd text-xl">
                    <span className="opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
                      ▶{" "}
                    </span>
                    Chapter {String(index + 1).padStart(2, "0")}
                  </span>
                  {project.year ? <span className="osd text-xl">{project.year}</span> : null}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="flex flex-wrap items-baseline gap-2 font-display text-2xl font-semibold tracking-wide uppercase">
                    {project.name}
                    {project.tag ? (
                      <span className="osd rounded-sm bg-zest px-2 font-normal text-base tracking-wider text-deep">
                        {project.tag}
                      </span>
                    ) : null}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {project.description}
                  </p>
                  {project.links.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {project.links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          className={textLink}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <ColorBars />

        {/* Now, open to, favorites: the same facts index.md and the MCP tools give agents */}
        <section id="now" className="scroll-mt-24 pt-16 pb-20">
          <p className="osd text-xl text-ink-faint">CH 99 · Status report</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-wide uppercase sm:text-5xl">
            What I&rsquo;m up to <span className="marker">now</span>.
          </h2>
          <p className="osd mt-3 text-lg text-ink-faint">Updated {personal.updated}</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <StatusCard title="Now" color="var(--zest)">
              <dl className="space-y-4">
                <StatusRow label="Focus">{personal.now.focus}</StatusRow>
                <StatusRow label="Building">{personal.now.building.join("; ")}</StatusRow>
                <StatusRow label="Reading">{personal.now.reading.join("; ")}</StatusRow>
                <StatusRow label="Watching">
                  My{" "}
                  <a href={letterboxd.profile} className={textLink}>
                    Letterboxd
                  </a>{" "}
                  diary, shelved on{" "}
                  <Link href="/watched" className={textLink}>
                    the wall
                  </Link>
                </StatusRow>
              </dl>
            </StatusCard>
            <StatusCard title="Open to" color="var(--peri)">
              <p className="text-sm leading-relaxed text-ink">{personal.openTo.status}</p>
              <dl className="mt-4 space-y-4">
                {personal.openTo.items.map((item) => (
                  <StatusRow key={item.topic} label={item.topic}>
                    {item.detail}
                  </StatusRow>
                ))}
                <StatusRow label="Best way to reach me">
                  {personal.openTo.contact.map((contact, index) => (
                    <span key={contact.url}>
                      {index > 0 ? " or " : null}
                      <a href={contact.url} className={textLink}>
                        {contact.label}
                      </a>
                    </span>
                  ))}
                </StatusRow>
              </dl>
            </StatusCard>
            <StatusCard title="Favorites" color="var(--tang)">
              <dl className="space-y-4">
                <StatusRow label="Films">{personal.favorites.films.join(", ")}</StatusRow>
                <StatusRow label="Cocktails">{personal.favorites.cocktails.join(", ")}</StatusRow>
              </dl>
            </StatusCard>
          </div>
        </section>

        <ColorBars />

        {/* Letterboxd: video-store shelf */}
        <section id="watching" className="scroll-mt-24 pt-16 pb-24">
          <p className="osd text-xl text-ink-faint">CH 501 · What I&rsquo;ve been watching</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-wide uppercase sm:text-5xl">
            Fresh off the <span className="marker">Letterboxd</span> return slot.
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
            Straight from my{" "}
            <a
              href={watched.profileUrl}
              className={textLink}
            >
              Letterboxd
            </a>{" "}
            diary, restocked every hour. Here&rsquo;s the latest dozen; the rest are on{" "}
            <Link
              href="/watched"
              className={textLink}
            >
              the whole wall
            </Link>
            .
          </p>
          <WatchingShelf films={watched.entries.slice(0, SHELF_SIZE)} profileUrl={watched.profileUrl} />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

import Link from "next/link";
import { ColorBars } from "@/components/color-bars";
import { CrtPortrait } from "@/components/crt-portrait";
import { McpCard } from "@/components/mcp-card";
import { ThemeToggle } from "@/components/theme-toggle";
import { resume } from "@/content/resume";
import { site, socialLinks } from "@/content/site";

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

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line/60 bg-screen/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 sm:px-8">
          <Link
            href="/"
            className="font-display text-2xl font-semibold tracking-wide text-glow uppercase"
          >
            Brody Berson
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <a
              href="#mcp"
              className="osd hidden rounded-md border border-line bg-screen-2 px-2.5 py-0.5 text-base text-ink-soft transition-colors hover:border-glow hover:text-glow sm:block"
            >
              /mcp
            </a>
            <Link href="/resume" className="font-medium text-ink-soft transition-colors hover:text-glow">
              Resume
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 sm:px-8">
        {/* Hero: title card */}
        <section className="grid items-center gap-12 pt-14 pb-20 sm:grid-cols-[1fr_auto] sm:pt-20 sm:pb-24">
          <div>
            <p className="osd fade-up text-xl text-ink-faint">▶ Now playing · {site.location}</p>
            <h1
              className="title-glow fade-up mt-3 font-display text-7xl leading-[0.9] font-semibold tracking-wide uppercase sm:text-8xl"
              style={{ animationDelay: "60ms" }}
            >
              Hi, I&rsquo;m Brody.
            </h1>
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
              Forward Deployed Engineer at{" "}
              <a href="https://ravenna.ai" className="marker font-medium text-ink">
                Ravenna
              </a>
              . Previously embedded on{" "}
              <a href="https://zapier.com/mcp" className="marker font-medium text-ink">
                Zapier&rsquo;s MCP team
              </a>{" "}
              from its infancy, introducing it to AI partners like OpenAI, Anthropic, Google, and
              Meta.
            </p>
            <p
              className="fade-up mt-4 max-w-xl leading-relaxed text-ink-soft"
              style={{ animationDelay: "180ms" }}
            >
              Off the clock it&rsquo;s home-server tinkering,{" "}
              <a
                href="https://letterboxd.com/mynamebrody/"
                className="font-medium text-ink underline decoration-pop decoration-2 underline-offset-4 hover:text-glow"
              >
                Letterboxd
              </a>{" "}
              logging, and chasing down a good cocktail recipe.
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
          <div className="fade-up justify-self-center" style={{ animationDelay: "150ms" }}>
            <CrtPortrait size={240} alt="Brody's memoji" priority />
          </div>
        </section>

        <ColorBars />

        {/* MCP */}
        <section id="mcp" className="scroll-mt-24 pt-16 pb-20">
          <p className="osd text-xl text-ink-faint">CH 08 · For your agent</p>
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
            <a href="/.well-known/mcp.json" className="underline underline-offset-4 hover:text-glow">server card</a>
          </p>
        </section>

        <ColorBars />

        {/* Career: TV guide */}
        <section className="pt-16 pb-20">
          <p className="osd text-xl text-ink-faint">CH 09 · Where I&rsquo;ve been</p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-wide uppercase sm:text-5xl">
            A decade of <span className="marker">APIs</span>, integrations, and partners.
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
            Three stints at Zapier, a cofounded startup that got acquired, enterprise solutions
            engineering, and now forward-deployed at Ravenna. The full story (every role, every
            bullet) lives on the resume.
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
        <section className="pt-16 pb-24">
          <p className="osd text-xl text-ink-faint">CH 10 · Side quests</p>
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
                          className="font-medium text-ink underline decoration-pop decoration-2 underline-offset-4 hover:text-glow"
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
      </main>

      {/* Sign-off */}
      <footer className="bg-screen-2">
        <ColorBars size="tall" />
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
          <p className="osd text-xl text-ink-faint">BBTV · End of broadcast</p>
          <div className="mt-6 flex flex-col justify-between gap-8 sm:flex-row">
            <div>
              <p className="font-display text-2xl font-semibold tracking-wide uppercase">Brody Berson</p>
              <p className="mt-1 text-sm text-ink-soft">{site.location}</p>
              <a
                href={`mailto:${site.email}`}
                className="mt-1 inline-block text-sm font-medium text-ink underline decoration-pop decoration-2 underline-offset-4 hover:text-glow"
              >
                {site.email}
              </a>
            </div>
            <nav className="grid grid-cols-2 gap-x-10 gap-y-1.5 text-sm sm:grid-cols-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  className="text-ink-soft transition-colors hover:text-glow"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="osd mt-10 flex flex-col gap-2 border-t border-line pt-6 text-base text-ink-faint normal-case sm:flex-row sm:items-center sm:justify-between">
            <p>
              Reading this as an AI?{" "}
              <a href="/AGENTS.md" className="underline underline-offset-4 hover:text-glow">
                AGENTS.md
              </a>{" "}
              ·{" "}
              <a href="/llms.txt" className="underline underline-offset-4 hover:text-glow">
                llms.txt
              </a>{" "}
              ·{" "}
              <a href="/mcp" className="underline underline-offset-4 hover:text-glow">
                /mcp
              </a>
            </p>
            <p>
              <a
                href="https://github.com/mynamebrody/brody-berson"
                className="underline underline-offset-4 hover:text-glow"
              >
                Source on GitHub
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { McpCard } from "@/components/mcp-card";
import { resume } from "@/content/resume";
import { site, socialLinks } from "@/content/site";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-line/60 bg-paper/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">
            Brody Berson
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <a
              href="#mcp"
              className="hidden rounded-full border border-line bg-cream px-3 py-1 font-mono text-xs text-ink-soft transition-colors hover:border-blue hover:text-blue-ink sm:block"
            >
              /mcp
            </a>
            <Link href="/resume" className="text-ink-soft transition-colors hover:text-blue-ink">
              Resume
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 sm:px-8">
        {/* Hero */}
        <section className="grid items-center gap-10 pt-14 pb-20 sm:grid-cols-[1fr_auto] sm:pt-20 sm:pb-24">
          <div>
            <p className="fade-up font-mono text-xs tracking-widest text-ink-faint uppercase">
              {site.location}
            </p>
            <h1
              className="fade-up mt-4 font-display text-5xl font-semibold tracking-tight text-balance sm:text-6xl"
              style={{ animationDelay: "60ms" }}
            >
              Hi, I&rsquo;m Brody.
            </h1>
            <p
              className="fade-up mt-5 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl"
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
                className="font-medium text-blue-ink underline decoration-blue/40 underline-offset-4 hover:decoration-blue"
              >
                Letterboxd
              </a>{" "}
              logging, and chasing down a good cocktail recipe.
            </p>
            <div className="fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "240ms" }}>
              <Link
                href="/resume"
                className="rounded-lg bg-blue-deep px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-ink"
              >
                View resume
              </Link>
              <a
                href="#mcp"
                className="rounded-lg border border-line bg-cream px-5 py-2.5 font-mono text-sm text-ink-soft transition-colors hover:border-blue hover:text-blue-ink"
              >
                Connect your agent ↓
              </a>
            </div>
          </div>
          <div className="fade-up justify-self-center" style={{ animationDelay: "150ms" }}>
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-butter-soft" aria-hidden />
              <div className="absolute -inset-3 rounded-full border border-butter" aria-hidden />
              <Image
                src="/memoji.png"
                alt="Brody's memoji"
                width={190}
                height={190}
                priority
                className="relative"
              />
            </div>
          </div>
        </section>

        {/* MCP */}
        <section id="mcp" className="scroll-mt-24 border-t border-line pt-16 pb-20">
          <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">
            For your agent
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            This site speaks <span className="marker">MCP</span>.
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
            My personal site ships its own Model Context Protocol server. Add it to Claude
            Desktop, Cursor, or any MCP client — your AI can query my resume, projects, and
            contact info directly. No API keys, no auth, just the URL.
          </p>
          <div className="mt-8">
            <McpCard />
          </div>
          <p className="mt-4 font-mono text-xs text-ink-faint">
            Prefer plain files? <a href="/AGENTS.md" className="underline underline-offset-4 hover:text-blue-ink">AGENTS.md</a> ·{" "}
            <a href="/llms.txt" className="underline underline-offset-4 hover:text-blue-ink">llms.txt</a> ·{" "}
            <a href="/.well-known/mcp.json" className="underline underline-offset-4 hover:text-blue-ink">server card</a>
          </p>
        </section>

        {/* Career */}
        <section className="border-t border-line pt-16 pb-20">
          <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">
            Where I&rsquo;ve been
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            A decade of APIs, integrations, and partners.
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
            Three stints at Zapier, a cofounded startup that got acquired, enterprise solutions
            engineering, and now forward-deployed at Ravenna. The full story — every role, every
            bullet — lives on the resume.
          </p>
          <Link
            href="/resume"
            className="mt-6 inline-block rounded-lg bg-blue-deep px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-ink"
          >
            View the full resume →
          </Link>
        </section>

        {/* Projects */}
        <section className="border-t border-line pt-16 pb-24">
          <p className="font-mono text-xs tracking-widest text-ink-faint uppercase">Side quests</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Things built for the fun of it.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {resume.projects.map((project) => (
              <article
                key={project.name}
                className="flex flex-col rounded-xl border border-line bg-white/50 p-6 transition-colors hover:border-blue/50"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="flex flex-wrap items-baseline gap-2 font-display text-xl font-semibold">
                    {project.name}
                    {project.tag ? (
                      <span className="rounded-full bg-butter-soft px-2.5 py-0.5 font-sans text-xs font-normal text-ink-soft">
                        {project.tag}
                      </span>
                    ) : null}
                  </h3>
                  {project.year ? (
                    <span className="font-mono text-xs text-ink-faint">{project.year}</span>
                  ) : null}
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                  {project.description}
                </p>
                {project.links.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {project.links.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        className="font-medium text-blue-ink underline decoration-blue/40 underline-offset-4 hover:decoration-blue"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-cream">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
          <div className="flex flex-col justify-between gap-8 sm:flex-row">
            <div>
              <p className="font-display text-lg font-semibold">Brody Berson</p>
              <p className="mt-1 text-sm text-ink-soft">{site.location}</p>
              <a
                href={`mailto:${site.email}`}
                className="mt-1 inline-block text-sm font-medium text-blue-ink underline decoration-blue/40 underline-offset-4 hover:decoration-blue"
              >
                {site.email}
              </a>
            </div>
            <nav className="grid grid-cols-2 gap-x-10 gap-y-1.5 text-sm sm:grid-cols-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  className="text-ink-soft transition-colors hover:text-blue-ink"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 font-mono text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
            <p>
              Reading this as an AI?{" "}
              <a href="/AGENTS.md" className="underline underline-offset-4 hover:text-blue-ink">
                AGENTS.md
              </a>{" "}
              ·{" "}
              <a href="/llms.txt" className="underline underline-offset-4 hover:text-blue-ink">
                llms.txt
              </a>{" "}
              ·{" "}
              <a href="/mcp" className="underline underline-offset-4 hover:text-blue-ink">
                /mcp
              </a>
            </p>
            <p>
              <a
                href="https://github.com/mynamebrody/brody-berson"
                className="underline underline-offset-4 hover:text-blue-ink"
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

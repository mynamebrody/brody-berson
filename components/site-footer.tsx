import { ColorBars } from "@/components/color-bars";
import { site, socialLinks } from "@/content/site";

/** The BBTV sign-off: tall color bars, contact, socials, and the agent links. */
export function SiteFooter() {
  return (
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
  );
}

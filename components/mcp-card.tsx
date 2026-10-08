import { mcpPrompts, mcpTools, site } from "@/content/site";
import { ConnectTabs, type ConnectTab } from "./connect-tabs";
import { CopyButton } from "./copy-button";

const cursorConfig = Buffer.from(JSON.stringify({ url: site.mcpUrl })).toString("base64");

const mcpJson = JSON.stringify(
  { mcpServers: { brodyberson: { url: site.mcpUrl } } },
  null,
  2
);

const tabs: ConnectTab[] = [
  {
    id: "cursor",
    label: "Cursor",
    hint: "One click below, or paste into ~/.cursor/mcp.json:",
    snippet: mcpJson,
    action: {
      label: "Add to Cursor",
      href: `https://cursor.com/en/install-mcp?name=brodyberson&config=${encodeURIComponent(cursorConfig)}`,
    },
  },
  {
    id: "claude-code",
    label: "Claude Code",
    hint: "Run this in your terminal:",
    snippet: `claude mcp add --transport http brodyberson ${site.mcpUrl}`,
  },
  {
    id: "claude-desktop",
    label: "Claude Desktop",
    hint: "Settings → Connectors → Add custom connector, then paste:",
    snippet: site.mcpUrl,
  },
  {
    id: "any-client",
    label: "Anything else",
    hint: "Any MCP client that speaks streamable HTTP just needs the URL:",
    snippet: site.mcpUrl,
  },
];

// Prompts are listed as slash commands, the way most clients surface them
const guide = [...mcpTools, ...mcpPrompts.map((p) => ({ ...p, name: `/${p.name}` }))];

export function McpCard() {
  return (
    // prime-tokens pins the Primetime palette so this always reads as a TV setup menu
    <div className="prime-tokens scanlines overflow-hidden rounded-2xl border border-line bg-screen text-ink shadow-[0_0_0_6px_rgba(5,6,26,0.85),0_30px_70px_-30px_rgba(58,76,255,0.7)]">
      <div className="flex items-center justify-between gap-4 border-b border-line bg-signal/25 px-6 py-3 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-zest opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-zest" />
          </span>
          <span className="osd text-lg text-glow">
            MCP setup ▸<span className="rec-blink">_</span>
          </span>
        </div>
        <span className="osd hidden text-base text-ink-faint sm:block">
          streamable HTTP · no auth
        </span>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-line bg-black/40 px-4 py-3 font-mono text-sm text-glow [text-shadow:0_0_10px_rgba(143,211,255,0.55)] sm:text-base">
            {site.mcpUrl}
          </code>
          <CopyButton text={site.mcpUrl} />
        </div>

        <div className="mt-7">
          <ConnectTabs tabs={tabs} />
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <div className="flex items-baseline justify-between gap-4">
            <p className="osd text-lg text-ink-faint">MCP guide · What your agent can ask</p>
            <p className="osd text-base text-ink-faint">
              {guide.length} items · scroll ↕
            </p>
          </div>
          {/* Fixed-height rows so exactly three fit in view; the rest scroll */}
          <ul
            tabIndex={0}
            aria-label="MCP tools and prompts"
            className="mt-3 h-[15.75rem] snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-lg border border-line focus-visible:outline-2 focus-visible:outline-glow sm:h-[8.25rem]"
          >
            {guide.map((tool) => (
              <li
                key={tool.name}
                className="grid h-[5.25rem] snap-start content-center gap-1 px-4 text-sm odd:bg-white/[0.04] sm:h-[2.75rem] sm:grid-cols-[12rem_1fr] sm:items-center sm:gap-4"
              >
                <code className="font-mono text-zest">{tool.name}</code>
                <span className="line-clamp-2 text-ink-soft sm:line-clamp-1">{tool.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

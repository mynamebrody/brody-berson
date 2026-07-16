import { mcpTools, site } from "@/content/site";
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

export function McpCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-ink text-paper shadow-[0_24px_60px_-24px_rgba(38,52,74,0.45)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-butter opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-butter" />
          </span>
          <span className="font-mono text-xs tracking-widest text-white/60 uppercase">
            Model Context Protocol
          </span>
        </div>
        <span className="hidden font-mono text-xs text-white/40 sm:block">
          streamable HTTP · no auth
        </span>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-white/15 bg-black/30 px-4 py-3 font-mono text-sm text-butter sm:text-base">
            {site.mcpUrl}
          </code>
          <CopyButton text={site.mcpUrl} />
        </div>

        <div className="mt-7">
          <ConnectTabs tabs={tabs} />
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="font-mono text-xs tracking-widest text-white/60 uppercase">
            What your agent can ask
          </p>
          <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {mcpTools.map((tool) => (
              <li key={tool.name} className="flex gap-2.5 text-sm">
                <code className="shrink-0 font-mono text-butter">{tool.name}</code>
                <span className="text-white/60">{tool.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

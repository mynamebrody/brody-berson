import { mcpTools, site } from "@/content/site";

export const dynamic = "force-static";

export function GET() {
  const card = {
    schemaVersion: "draft-01",
    name: "Brody Berson personal MCP",
    version: "1.0.0",
    description:
      "Personal MCP server for brodyberson.com — provides tools for retrieving Brody Berson's resume, projects, and contact links.",
    url: site.mcpUrl,
    transport: "streamable-http",
    protocolVersion: "2025-06-18",
    authentication: { type: "none" },
    capabilities: { tools: { listChanged: true } },
    tools: mcpTools.map((t) => ({ name: t.name, description: t.description })),
    owner: { name: site.name, url: site.url },
    documentation: `${site.url}/AGENTS.md`,
  };

  return Response.json(card);
}

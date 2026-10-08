import { mcpServer, site } from "@/content/site";

export const serverCardUrl = `${site.mcpUrl}/server-card`;

/** MCP Server Card (SEP-2127, v1 schema). Identity and transport only:
 * tools, prompts, and capabilities are discovered at runtime, not listed here. */
export function serverCard() {
  return {
    $schema: "https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json",
    name: mcpServer.name,
    title: mcpServer.title,
    version: mcpServer.version,
    description: mcpServer.description,
    websiteUrl: site.url,
    repository: { url: mcpServer.repository, source: "github" },
    icons: mcpServer.icons,
    remotes: [
      {
        type: "streamable-http",
        url: site.mcpUrl,
        supportedProtocolVersions: mcpServer.protocolVersions,
      },
    ],
  };
}

/** AI Catalog (/.well-known/ai-catalog.json) pointing crawlers at the server card. */
export function aiCatalog() {
  return {
    specVersion: "1.0",
    entries: [
      {
        identifier: `urn:air:${site.domain}:mcp:personal`,
        type: "application/mcp-server-card+json",
        url: serverCardUrl,
      },
    ],
  };
}

/** Public, read-only discovery documents: any origin may fetch them. */
export const discoveryHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=3600",
};

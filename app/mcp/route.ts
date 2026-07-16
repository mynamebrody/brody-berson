import { createMcpHandler } from "mcp-handler";
import { resume } from "@/content/resume";
import { mcpTools, site, socialLinks } from "@/content/site";
import { resumeMarkdown } from "@/lib/markdown";

function text(value: string) {
  return { content: [{ type: "text" as const, text: value }] };
}

function json(value: unknown) {
  return text(JSON.stringify(value, null, 2));
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "about",
      {
        title: "About Brody Berson",
        description:
          "Who Brody is, what this site is, and what tools are available. Start here.",
      },
      async () =>
        text(
          [
            `This is the personal MCP server for ${site.name} (${site.url}).`,
            "",
            `${site.headline} (${site.headlineNote}). ${site.bio[0]}`,
            "",
            "Available tools:",
            ...mcpTools.map((t) => `- ${t.name}: ${t.description}`),
            "",
            `Human-readable site: ${site.url} · Agent guide: ${site.url}/AGENTS.md`,
          ].join("\n")
        )
    );

    server.registerTool(
      "get_resume",
      {
        title: "Get resume",
        description:
          "Brody Berson's full resume as structured JSON: work history, education, projects, and skills.",
      },
      async () => json(resume)
    );

    server.registerTool(
      "download_resume",
      {
        title: "Download resume",
        description:
          "Links to download Brody's resume as a PDF or markdown, plus the HTML version.",
      },
      async () =>
        json({
          pdf: `${site.url}/brody-berson-resume.pdf`,
          markdown: `${site.url}/resume.md`,
          html: `${site.url}/resume`,
        })
    );

    server.registerTool(
      "get_projects",
      {
        title: "Get projects",
        description: "Brody's side projects and hacks, with descriptions and links.",
      },
      async () => json(resume.projects)
    );

    server.registerTool(
      "get_links",
      {
        title: "Get links",
        description: "Contact info and social links for Brody Berson.",
      },
      async () =>
        json({
          email: site.email,
          website: site.url,
          location: site.location,
          social: socialLinks,
        })
    );

    server.registerResource(
      "resume",
      `${site.url}/resume.md`,
      {
        title: "Resume (markdown)",
        description: "Brody Berson's resume as markdown.",
        mimeType: "text/markdown",
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: resumeMarkdown() }],
      })
    );
  },
  {
    serverInfo: {
      name: "brodyberson",
      version: "1.0.0",
    },
    capabilities: {},
    instructions: `Personal MCP server for ${site.name} — query his resume, projects, and contact info. Call the "about" tool first for an overview.`,
  },
  {
    basePath: "",
    disableSse: true,
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST, handler as DELETE };

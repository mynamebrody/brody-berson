import { resume } from "@/content/resume";
import { mcpTools, site, socialLinks } from "@/content/site";

function dateRange(start: string, end: string) {
  return end ? `${start} – ${end}` : start;
}

export function resumeMarkdown(): string {
  const lines: string[] = [
    `# ${resume.basics.name}: Resume`,
    "",
    `${resume.basics.label}`,
    "",
    `${resume.basics.location} · ${resume.basics.email} · ${resume.basics.url}`,
    "",
    resume.basics.summary,
    "",
    "## Work experience",
    "",
  ];

  for (const job of resume.work) {
    const note = job.note ? ` (${job.note})` : "";
    lines.push(
      `### ${job.position} · ${job.company}${note}`,
      "",
      `${dateRange(job.startDate, job.endDate)}${job.location ? ` · ${job.location}` : ""}`,
      "",
      ...job.highlights.map((h) => `- ${h}`),
      ""
    );
  }

  lines.push("## Projects", "");
  for (const project of resume.projects) {
    const year = project.year ? ` (${project.year})` : "";
    const tag = project.tag ? `, ${project.tag}` : "";
    const links = project.links.map((l) => `[${l.label}](${l.url})`).join(" · ");
    lines.push(`### ${project.name}${year}${tag}`, "", project.description, "");
    if (links) lines.push(links, "");
  }

  lines.push("## Education", "");
  for (const edu of resume.education) {
    const name = edu.url ? `[${edu.institution}](${edu.url})` : edu.institution;
    lines.push(`- **${name}**: ${edu.studyType}, ${edu.area} (${edu.startDate} – ${edu.endDate})`);
  }

  lines.push("", "## Skills", "", ...resume.skills.map((s) => `- ${s}`), "");
  lines.push(
    "---",
    "",
    `PDF version: ${site.url}/brody-berson-resume.pdf`,
    `HTML version: ${site.url}/resume`,
    ""
  );

  return lines.join("\n");
}

export function homeMarkdown(): string {
  return [
    `# ${site.name}`,
    "",
    `${site.headline} · ${site.location}`,
    "",
    ...site.bio.flatMap((p) => [p, ""]),
    "## MCP server",
    "",
    `This site ships a Model Context Protocol server over streamable HTTP: ${site.mcpUrl}`,
    "",
    ...mcpTools.map((t) => `- \`${t.name}\`: ${t.description}`),
    "",
    "## Pages",
    "",
    `- Home: ${site.url} (markdown: ${site.url}/index.md)`,
    `- Resume: ${site.url}/resume (markdown: ${site.url}/resume.md, PDF: ${site.url}/brody-berson-resume.pdf)`,
    "",
    "## Links",
    "",
    `- Email: ${site.email}`,
    ...socialLinks.map((l) => `- ${l.label}: ${l.url}`),
    "",
  ].join("\n");
}

export function agentsMarkdown(): string {
  return [
    `# Agent guide: ${site.domain}`,
    "",
    `You've reached the personal site of ${site.name} (${site.headline}).`,
    "This page is for AI agents visiting the site: plain markdown a human could read too, but built so a model can parse it fast.",
    "",
    "## MCP server",
    "",
    `Streamable HTTP endpoint: ${site.mcpUrl}`,
    "",
    "No authentication required. Available tools:",
    "",
    ...mcpTools.map((t) => `- \`${t.name}\`: ${t.description}`),
    "",
    `Server card: ${site.url}/.well-known/mcp.json`,
    "",
    "Connect examples:",
    "",
    "```json",
    JSON.stringify({ mcpServers: { brodyberson: { url: site.mcpUrl } } }, null, 2),
    "```",
    "",
    "```bash",
    `claude mcp add --transport http brodyberson ${site.mcpUrl}`,
    "```",
    "",
    "## Pages and markdown mirrors",
    "",
    "Key pages and their machine-readable mirrors:",
    "",
    `- ${site.url}/index.md: home`,
    `- ${site.url}/resume.md: resume`,
    `- ${site.url}/links: link hub (HTML, excluded from search indexing)`,
    "",
    "## Discovery files",
    "",
    `- ${site.url}/llms.txt: index for language models`,
    `- ${site.url}/sitemap.xml: sitemap`,
    `- ${site.url}/robots.txt: crawler directives`,
    `- ${site.url}/.well-known/mcp.json: MCP server card`,
    "",
    "## About Brody",
    "",
    ...site.bio.flatMap((p) => [p, ""]),
    "## Contact",
    "",
    `- Email: ${site.email}`,
    ...socialLinks.map((l) => `- ${l.label}: ${l.url}`),
    "",
  ].join("\n");
}

export function llmsTxt(): string {
  return [
    `# ${site.name}`,
    "",
    `> ${site.headline}. Previously embedded on Zapier's MCP team from its infancy, working with AI partners like OpenAI, Anthropic, Google, Microsoft, Meta, and xAI.`,
    "",
    "## Site",
    "",
    `- [Home](${site.url}): who Brody is, current work, projects. Markdown mirror: ${site.url}/index.md`,
    `- [Resume](${site.url}/resume): full background. Markdown mirror: ${site.url}/resume.md · PDF: ${site.url}/brody-berson-resume.pdf`,
    `- [Links](${site.url}/links): primary websites and social profiles. Excluded from search indexing.`,
    "",
    "## Machine-readable",
    "",
    `- ${site.mcpUrl}: MCP server (streamable HTTP, no auth). Tools: ${mcpTools.map((t) => t.name).join(", ")}.`,
    `- ${site.url}/.well-known/mcp.json: MCP server card`,
    `- ${site.url}/AGENTS.md: agent-facing guide`,
    `- ${site.url}/sitemap.xml: sitemap`,
    "",
    "## Contact",
    "",
    `- Email: ${site.email}`,
    ...socialLinks.map((l) => `- ${l.label}: ${l.url}`),
    "",
  ].join("\n");
}

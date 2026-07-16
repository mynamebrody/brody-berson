export const site = {
  name: "Brody Berson",
  firstName: "Brody",
  domain: "brodyberson.com",
  url: "https://brodyberson.com",
  mcpPath: "/mcp",
  mcpUrl: "https://brodyberson.com/mcp",
  email: "hello@brodyberson.com",
  location: "East Grand Rapids, MI",
  headline: "Forward Deployed Engineer at Ravenna",
  headlineNote: "starting August 2026",
  description:
    "Brody Berson — Forward Deployed Engineer at Ravenna. Previously embedded on Zapier's MCP team, working with AI partners like OpenAI, Anthropic, Google, and Meta. This site ships its own MCP server.",
  bio: [
    "I'm a solutions engineer who lives where APIs, AI agents, and partnerships meet. I spent the last two-plus years at Zapier embedded on the MCP team from its infancy — watching the product grow up and introducing it to AI partners like OpenAI, Anthropic, Google, and Meta.",
    "In August 2026 I'm joining Ravenna, the agentic service desk for IT, HR, and Ops teams that lives in Slack, as a Forward Deployed Engineer.",
    "Off the clock: I made cinamini, a daily movie puzzle. I tinker with home servers and smart homes, log everything on Letterboxd, and chase down good cocktail recipes.",
  ],
} as const;

export type SocialLink = {
  label: string;
  url: string;
};

export const socialLinks: SocialLink[] = [
  { label: "GitHub", url: "https://github.com/mynamebrody" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/mynamebrody/" },
  { label: "Letterboxd", url: "https://letterboxd.com/mynamebrody/" },
  { label: "Instagram", url: "https://instagram.com/mynamebrody" },
  { label: "Threads", url: "https://www.threads.net/@mynamebrody" },
  { label: "Bluesky", url: "https://bsky.app/profile/brody.bsky.social" },
  { label: "Twitter", url: "https://twitter.com/mynamebrody_" },
];

export type McpToolInfo = {
  name: string;
  description: string;
};

/** Single source of truth for the MCP tool list shown on the site,
 * in AGENTS.md, and in the .well-known server card. Keep in sync with
 * the registrations in app/mcp/route.ts. */
export const mcpTools: McpToolInfo[] = [
  {
    name: "about",
    description: "Who Brody is, what this site is, and what tools are available.",
  },
  {
    name: "get_resume",
    description: "Brody's full resume as structured JSON.",
  },
  {
    name: "download_resume",
    description: "Links to download the resume as a PDF or markdown.",
  },
  {
    name: "get_projects",
    description: "Side projects and hacks, with links.",
  },
  {
    name: "get_links",
    description: "Contact info and social links.",
  },
];

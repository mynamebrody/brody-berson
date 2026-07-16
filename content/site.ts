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
  description:
    "Brody Berson — Forward Deployed Engineer at Ravenna. Previously embedded on Zapier's MCP team, working with AI partners like OpenAI, Anthropic, Google, and Meta. This site ships its own MCP server.",
  bio: [
    "I'm a Forward Deployed Engineer at Ravenna — the agentic service desk for IT, HR, and Operations that lives in Slack — working where APIs, AI agents, rapid prototyping, and partnerships meet.",
    "Previously I spent two-plus years at Zapier embedded on the MCP team from its infancy — watching the product grow up and introducing it to AI partners like OpenAI, Anthropic, Google, Microsoft, Meta, and xAI.",
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

export const linkHub = {
  bio: [
    "Forward Deployed Engineer at Ravenna.",
    "AI agents, home servers, movies, and cocktails.",
  ],
  socialLabels: ["Twitter", "Instagram", "YouTube", "TikTok"],
  primaryLinks: [
    { label: "Visit brodyberson.com", url: site.url },
    { label: "View my résumé", url: "/resume" },
    { label: "Play cinamini", url: "https://cinamini.app" },
    { label: "Explore my GitHub", url: "https://github.com/mynamebrody" },
    { label: "See my Letterboxd", url: "https://letterboxd.com/mynamebrody/" },
  ],
} as const;

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

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
    "Brody Berson: Forward Deployed Engineer at Ravenna. Previously embedded on Zapier's MCP team, working with AI partners like OpenAI, Anthropic, Google, and Meta. This site ships its own MCP server.",
  bio: [
    "I'm a Forward Deployed Engineer at Ravenna (the agentic service desk for IT, HR, and Operations that lives in Slack). My day-to-day is APIs, AI agents, rapid prototyping, and partnerships.",
    "Previously I spent two-plus years at Zapier embedded on the MCP team from its infancy, watching the product grow up and introducing it to AI partners like OpenAI, Anthropic, Google, Microsoft, Meta, and xAI.",
    "Off the clock: I made cinamini, a daily movie puzzle. I tinker with home servers and home automation, log everything on Letterboxd, and chase down good cocktail recipes.",
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

export const letterboxd = {
  profile: "https://letterboxd.com/mynamebrody/",
  rss: "https://letterboxd.com/mynamebrody/rss/",
};

/** Personal context for agents (MCP open_to / get_now / get_favorites and the
 * index.md mirror). There is no dedicated page for this; update `updated` when
 * the copy changes. */
export const personal = {
  updated: "October 2026",
  openTo: {
    status: "Happily at Ravenna; open to conversations, not actively looking.",
    items: [
      { topic: "Advising & collaborations", detail: "Open to them for the right opportunity." },
      { topic: "Speaking", detail: "Not usually, but nearby or local events could work." },
      { topic: "Intros", detail: "Only for people I know personally." },
    ],
    contact: [
      { label: "Email", url: `mailto:${site.email}` },
      socialLinks.find((l) => l.label === "LinkedIn")!,
    ],
  },
  now: {
    focus: "Building with AI and keeping up with the latest and greatest.",
    building: ["A UniFi home network", "An AI-controlled smart house"],
    reading: ["The Dungeon Crawler Carl series"],
    watching: `Recent watches are on Letterboxd (${letterboxd.profile}) and the get_recently_watched MCP tool.`,
  },
  favorites: {
    films: ["Donnie Darko", "Get Out", "Whiplash", "Scream"],
    cocktails: ["Last Word", "Banana Daiquiri"],
  },
};

export const linkHub = {
  bio: [
    "Forward Deployed Engineer at Ravenna.",
    "AI agents, home servers, movies, and cocktails.",
  ],
  socialLabels: ["Threads", "Instagram", "Letterboxd", "LinkedIn", "Twitter"],
  primaryLinks: [
    { label: "Visit brodyberson.com", url: site.url },
    { label: "Listen to Split Reels", url: "https://www.splitreels.com/" },
    { label: "Explore my GitHub", url: "https://github.com/mynamebrody" },
  ],
} as const;

export type McpToolInfo = {
  name: string;
  title: string;
  description: string;
};

export type McpServerInfo = {
  name: string;
  title: string;
  version: string;
  description: string;
  repository: string;
  protocolVersions: string[];
  icons: { src: string; mimeType: string; sizes: string[] }[];
};

/** Identity for the MCP server, shared by serverInfo in app/mcp/route.ts
 * and the server card (app/mcp/server-card/route.ts). */
export const mcpServer: McpServerInfo = {
  name: "com.brodyberson/mcp",
  title: "Brody Berson",
  version: "2.1.0",
  description: "Brody Berson's resume, work history, projects, and contact info.",
  repository: "https://github.com/mynamebrody/brody-berson",
  protocolVersions: ["2026-07-28", "2025-11-25", "2025-06-18", "2025-03-26"],
  icons: [
    { src: `${site.url}/ico/android-chrome-192x192.png`, mimeType: "image/png", sizes: ["192x192"] },
    { src: `${site.url}/ico/android-chrome-512x512.png`, mimeType: "image/png", sizes: ["512x512"] },
  ],
};

/** Single source of truth for the MCP tool list shown on the site,
 * in AGENTS.md, and in llms.txt. Titles and descriptions here are what
 * app/mcp/route.ts registers, so every tool listed must be registered there. */
export const mcpTools: McpToolInfo[] = [
  {
    name: "about",
    title: "About Brody Berson",
    description: "Who Brody is, what this server offers, and where to start.",
  },
  {
    name: "get_resume",
    title: "Get resume",
    description: "Brody's full resume as structured JSON: work, education, projects, and skills.",
  },
  {
    name: "get_experience",
    title: "Get work experience",
    description: "Work history, optionally filtered by company or start year.",
  },
  {
    name: "search_resume",
    title: "Search resume",
    description: "Keyword search across work highlights, projects, skills, and bio.",
  },
  {
    name: "get_skills",
    title: "Get skills",
    description: "Skills, current role, and tagline.",
  },
  {
    name: "get_projects",
    title: "Get projects",
    description: "Side projects and hacks, with links.",
  },
  {
    name: "download_resume",
    title: "Download resume",
    description: "Links to the resume as PDF, markdown, and HTML.",
  },
  {
    name: "get_links",
    title: "Get links",
    description: "Contact info and social links.",
  },
  {
    name: "open_to",
    title: "What Brody's open to",
    description: "Whether he's open to advising, collaborations, speaking, or intros, and how to reach him.",
  },
  {
    name: "get_now",
    title: "What Brody's up to now",
    description: "Current focus, what he's building, and what he's reading.",
  },
  {
    name: "get_favorites",
    title: "Get favorites",
    description: "All-time favorite films and cocktails.",
  },
  {
    name: "get_recently_watched",
    title: "Recently watched",
    description: "Recent films from Brody's Letterboxd: ratings, likes, and reviews.",
  },
];

/** MCP prompts (slash commands in most clients). Keep in sync with
 * the registerPrompt calls in app/mcp/route.ts. */
export const mcpPrompts: McpToolInfo[] = [
  {
    name: "assess_fit",
    title: "Assess fit for a role",
    description: "Paste a job description; get an honest read on how Brody's background fits.",
  },
  {
    name: "draft_intro",
    title: "Draft an intro to Brody",
    description: "Draft a short outreach email to Brody for a given purpose.",
  },
];

import { createMcpHandler, type McpHandlerOptions } from "mcp-handler";
import type {
  CallToolResult,
  CacheHint,
  Implementation,
  ResourceLink,
  ToolAnnotations,
} from "@modelcontextprotocol/server";
import { z } from "zod";
import { resume } from "@/content/resume";
import { mcpPrompts, mcpServer, mcpTools, personal, site, socialLinks } from "@/content/site";
import { getRecentlyWatched } from "@/lib/letterboxd";
import { homeMarkdown, resumeMarkdown } from "@/lib/markdown";

export const maxDuration = 60;

/** Every tool here is a public, read-only lookup over static content. */
const readOnly: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

/** Content only changes on deploy, so list/read results are safe to share-cache. */
const oneHour: CacheHint = { ttlMs: 60 * 60 * 1000, cacheScope: "public" };

const serverInfo: Implementation = {
  name: mcpServer.name,
  title: mcpServer.title,
  version: mcpServer.version,
  description: mcpServer.description,
  websiteUrl: site.url,
  icons: mcpServer.icons,
};

function catalog(list: typeof mcpTools, name: string) {
  const info = list.find((t) => t.name === name);
  if (!info) throw new Error(`"${name}" is missing from content/site.ts`);
  return { title: info.title, description: info.description };
}

const tool = (name: string) => ({ ...catalog(mcpTools, name), annotations: readOnly });
const prompt = (name: string) => catalog(mcpPrompts, name);

function text(value: string): CallToolResult {
  return { content: [{ type: "text", text: value }] };
}

/** Structured output plus the same JSON as text for clients without outputSchema support. */
function structured(value: Record<string, unknown>, extra: CallToolResult["content"] = []): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }, ...extra],
    structuredContent: value,
  };
}

const linkSchema = z.object({ label: z.string(), url: z.string() });

const watchedSchema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.number().nullable(),
  rating: z.number().nullable().describe("Stars out of 5 (half steps); null if unrated."),
  liked: z.boolean(),
  rewatch: z.boolean(),
  watchedDate: z.string(),
  url: z.string(),
  poster: z.string().nullable(),
  review: z.string().nullable().optional(),
});

const workSchema = z.object({
  company: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().optional(),
  url: z.string().optional(),
  note: z.string().optional(),
  highlights: z.array(z.string()),
});

const educationSchema = z.object({
  institution: z.string(),
  area: z.string(),
  studyType: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  url: z.string().optional(),
});

const projectSchema = z.object({
  name: z.string(),
  year: z.string().optional(),
  tag: z.string().optional(),
  description: z.string(),
  links: z.array(linkSchema),
});

const resumeSchema = z.object({
  basics: z.object({
    name: z.string(),
    label: z.string(),
    tagline: z.string(),
    email: z.string(),
    url: z.string(),
    location: z.string(),
    summary: z.string(),
  }),
  work: z.array(workSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
  skills: z.array(z.string()),
});

const resumeUrls = {
  pdf: `${site.url}/brody-berson-resume.pdf`,
  markdown: `${site.url}/resume.md`,
  html: `${site.url}/resume`,
};

const resumeLinks: ResourceLink[] = [
  { type: "resource_link", uri: resumeUrls.pdf, name: "brody-berson-resume.pdf", title: "Resume (PDF)", mimeType: "application/pdf" },
  { type: "resource_link", uri: resumeUrls.markdown, name: "resume.md", title: "Resume (markdown)", mimeType: "text/markdown" },
  { type: "resource_link", uri: resumeUrls.html, name: "resume", title: "Resume (web page)", mimeType: "text/html" },
];

/** Last four-digit year in a date like "Feb 2024"; "Present" counts as this year. */
function endYear(endDate: string) {
  const years = endDate.match(/\d{4}/g);
  return years ? Number(years[years.length - 1]) : new Date().getFullYear();
}

type SearchHit = { section: string; source: string; text: string; url?: string };

function searchCorpus(): SearchHit[] {
  return [
    { section: "summary", source: resume.basics.label, text: resume.basics.summary },
    ...site.bio.map((p) => ({ section: "bio", source: site.url, text: p })),
    ...resume.work.flatMap((job) =>
      [`${job.position} at ${job.company}`, ...job.highlights].map((h) => ({
        section: "work",
        source: `${job.position} · ${job.company} (${job.startDate} – ${job.endDate})`,
        text: h,
        url: job.url,
      }))
    ),
    ...resume.projects.map((p) => ({
      section: "projects",
      source: p.year ? `${p.name} (${p.year})` : p.name,
      text: p.description,
      url: p.links[0]?.url,
    })),
    ...resume.skills.map((s) => ({ section: "skills", source: "Skills", text: s })),
  ];
}

const handler = createMcpHandler(
  (server) => {
    // Registration order is the tools/list order; keep it matching mcpTools.
    server.registerTool("about", tool("about"), async () =>
      text(
        [
          `This is the personal MCP server for ${site.name} (${site.url}).`,
          "",
          site.bio[0],
          "",
          "Tools:",
          ...mcpTools.map((t) => `- ${t.name}: ${t.description}`),
          "",
          "Prompts:",
          ...mcpPrompts.map((p) => `- ${p.name}: ${p.description}`),
          "",
          `Human-readable site: ${site.url} · Agent guide: ${site.url}/AGENTS.md`,
        ].join("\n")
      )
    );

    server.registerTool(
      "get_resume",
      { ...tool("get_resume"), outputSchema: resumeSchema },
      async () => structured(resume)
    );

    server.registerTool(
      "get_experience",
      {
        ...tool("get_experience"),
        inputSchema: z.object({
          company: z
            .string()
            .optional()
            .describe('Company name to match, case-insensitive (e.g. "Zapier").'),
          since: z
            .number()
            .int()
            .optional()
            .describe("Only include roles that were active in or after this year."),
        }),
        outputSchema: z.object({ work: z.array(workSchema) }),
      },
      async ({ company, since }) => {
        const needle = company?.trim().toLowerCase();
        const work = resume.work.filter(
          (job) =>
            (!needle || job.company.toLowerCase().includes(needle)) &&
            (since === undefined || endYear(job.endDate) >= since)
        );
        return structured({ work });
      }
    );

    server.registerTool(
      "search_resume",
      {
        ...tool("search_resume"),
        inputSchema: z.object({
          query: z
            .string()
            .min(2)
            .describe('Keywords to look for, e.g. "MCP partners" or "TypeScript". Every word must match.'),
        }),
        outputSchema: z.object({
          query: z.string(),
          total: z.number(),
          matches: z.array(
            z.object({
              section: z.string(),
              source: z.string(),
              text: z.string(),
              url: z.string().optional(),
            })
          ),
        }),
      },
      async ({ query }) => {
        const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
        const matches = searchCorpus().filter((hit) => {
          const haystack = `${hit.source} ${hit.text}`.toLowerCase();
          return terms.every((term) => haystack.includes(term));
        });
        return structured({ query, total: matches.length, matches: matches.slice(0, 25) });
      }
    );

    server.registerTool(
      "get_skills",
      {
        ...tool("get_skills"),
        outputSchema: z.object({
          currentRole: z.string(),
          tagline: z.string(),
          skills: z.array(z.string()),
        }),
      },
      async () =>
        structured({
          currentRole: resume.basics.label,
          tagline: resume.basics.tagline,
          skills: [...resume.skills],
        })
    );

    server.registerTool(
      "get_projects",
      { ...tool("get_projects"), outputSchema: z.object({ projects: z.array(projectSchema) }) },
      async () => structured({ projects: resume.projects })
    );

    server.registerTool(
      "download_resume",
      {
        ...tool("download_resume"),
        outputSchema: z.object({ pdf: z.string(), markdown: z.string(), html: z.string() }),
      },
      async () => structured(resumeUrls, resumeLinks)
    );

    server.registerTool(
      "get_links",
      {
        ...tool("get_links"),
        outputSchema: z.object({
          email: z.string(),
          website: z.string(),
          location: z.string(),
          social: z.array(linkSchema),
        }),
      },
      async () =>
        structured({
          email: site.email,
          website: site.url,
          location: site.location,
          social: socialLinks,
        })
    );

    server.registerTool(
      "open_to",
      {
        ...tool("open_to"),
        outputSchema: z.object({
          updated: z.string(),
          status: z.string(),
          items: z.array(z.object({ topic: z.string(), detail: z.string() })),
          contact: z.array(linkSchema),
        }),
      },
      async () => structured({ updated: personal.updated, ...personal.openTo })
    );

    server.registerTool(
      "get_now",
      {
        ...tool("get_now"),
        outputSchema: z.object({
          updated: z.string(),
          focus: z.string(),
          building: z.array(z.string()),
          reading: z.array(z.string()),
          watching: z.string(),
        }),
      },
      async () => structured({ updated: personal.updated, ...personal.now })
    );

    server.registerTool(
      "get_favorites",
      {
        ...tool("get_favorites"),
        outputSchema: z.object({
          films: z.array(z.string()),
          cocktails: z.array(z.string()),
          recentFavorites: z.string(),
        }),
      },
      async () =>
        structured({
          ...personal.favorites,
          recentFavorites:
            'For recent favorites, call get_recently_watched with liked_only: true (or min_rating: 4).',
        })
    );

    server.registerTool(
      "get_recently_watched",
      {
        ...tool("get_recently_watched"),
        // Reads Brody's public Letterboxd feed, so results come from outside this site
        annotations: { ...readOnly, openWorldHint: true },
        inputSchema: z.object({
          limit: z.number().int().min(1).max(50).default(10).describe("How many films to return (1–50)."),
          liked_only: z.boolean().default(false).describe("Only films Brody marked as liked."),
          min_rating: z.number().min(0.5).max(5).optional().describe("Only films rated at least this many stars."),
          include_reviews: z.boolean().default(true).describe("Include review text when there is one."),
        }),
        outputSchema: z.object({
          profileUrl: z.string(),
          total: z.number().describe("Matching films in the feed before applying limit."),
          entries: z.array(watchedSchema),
        }),
      },
      async ({ limit, liked_only, min_rating, include_reviews }) => {
        const { entries, profileUrl } = await getRecentlyWatched();
        const matches = entries.filter(
          (film) =>
            (!liked_only || film.liked) &&
            (min_rating === undefined || (film.rating ?? 0) >= min_rating)
        );
        return structured({
          profileUrl,
          total: matches.length,
          entries: matches.slice(0, limit).map(({ review, ...film }) =>
            include_reviews ? { ...film, review } : film
          ),
        });
      }
    );

    server.registerPrompt(
      "assess_fit",
      {
        ...prompt("assess_fit"),
        argsSchema: z.object({
          job_description: z.string().describe("The job description or role summary to assess against."),
        }),
      },
      async ({ job_description }) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Assess how well ${site.name} fits the role below, using only his resume.`,
                "Be honest and specific: list the strongest matches with evidence from the resume, the real gaps, and questions worth asking him. Do not invent experience.",
                "",
                "## Role",
                "",
                job_description,
                "",
                "## Resume",
                "",
                resumeMarkdown(),
              ].join("\n"),
            },
          },
        ],
      })
    );

    server.registerPrompt(
      "draft_intro",
      {
        ...prompt("draft_intro"),
        argsSchema: z.object({
          purpose: z.string().describe('Why you are reaching out, e.g. "hiring for a solutions role".'),
          about_you: z.string().optional().describe("Who you are, so the email can introduce you."),
        }),
      },
      async ({ purpose, about_you }) => ({
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: [
                `Draft a short email to ${site.name} (${site.email}).`,
                `Purpose: ${purpose}`,
                ...(about_you ? [`About the sender: ${about_you}`] : []),
                "",
                "Keep it under 150 words, specific, and free of flattery. Reference something concrete from his background below when it is relevant to the purpose.",
                "",
                "## About Brody",
                "",
                ...site.bio,
                "",
                "## What Brody is open to (respect this)",
                "",
                personal.openTo.status,
                ...personal.openTo.items.map((i) => `- ${i.topic}: ${i.detail}`),
              ].join("\n"),
            },
          },
        ],
      })
    );

    server.registerResource(
      "resume",
      resumeUrls.markdown,
      {
        title: "Resume (markdown)",
        description: "Brody Berson's resume as markdown.",
        mimeType: "text/markdown",
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: resumeMarkdown() }],
      })
    );

    server.registerResource(
      "home",
      `${site.url}/index.md`,
      {
        title: "About Brody (markdown)",
        description: "Bio, current work, and links from the brodyberson.com home page.",
        mimeType: "text/markdown",
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: homeMarkdown() }],
      })
    );
  },
  {
    serverInfo,
    // The tool, prompt, and resource sets only change on deploy, so never promise list_changed notifications.
    capabilities: {
      tools: { listChanged: false },
      prompts: { listChanged: false },
      resources: { listChanged: false },
    },
    instructions: `Public, read-only MCP server for ${site.name}. Call "about" for an overview, "get_resume" for the full structured resume, or use the "assess_fit" prompt with a job description.`,
    cacheHints: {
      "tools/list": oneHour,
      "prompts/list": oneHour,
      "resources/list": oneHour,
      "resources/templates/list": oneHour,
      "resources/read": oneHour,
      "server/discover": oneHour,
    },
    onEvent: logEvent,
  }
);

/** One log line per call so Vercel logs show which clients use which tools. */
function logEvent(event: Parameters<NonNullable<McpHandlerOptions["onEvent"]>>[0]) {
  if (event.type !== "REQUEST_RECEIVED") return;
  const params = (event.parameters as { params?: Record<string, unknown> } | undefined)?.params;
  const meta = params?._meta as Record<string, unknown> | undefined;
  const client =
    (meta?.["io.modelcontextprotocol/clientInfo"] as { name?: string } | undefined)?.name ??
    (params?.clientInfo as { name?: string } | undefined)?.name;
  const target = params?.name ?? params?.uri;
  console.log(
    `[mcp] ${event.method}${target ? ` ${String(target)}` : ""}${client ? ` client=${client}` : ""}`
  );
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};

/** No auth and no cookies, so browser-based clients (e.g. the web MCP Inspector) may call from any origin. */
async function withCors(req: Request) {
  const res = await handler(req);
  const headers = new Headers(res.headers);
  for (const [key, value] of Object.entries(cors)) headers.set(key, value);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export { withCors as GET, withCors as POST };

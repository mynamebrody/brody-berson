# AGENTS.md — contributing to brodyberson.com

This repo is the personal site for Brody Berson ([brodyberson.com](https://brodyberson.com)). It is also a native [Model Context Protocol](https://modelcontextprotocol.io) server: clients can connect to `/mcp` (no auth) and query resume, projects, and contact info.

**Two different AGENTS.md files exist:**

| Path | Audience |
| --- | --- |
| **This file** (`/AGENTS.md` in the repo root) | Coding agents editing the codebase |
| **`/AGENTS.md` on the live site** (`app/AGENTS.md/route.ts` → `agentsMarkdown()`) | External AI agents visiting the published site (MCP connect guide, discovery links) |

Do not conflate them. Visitor-facing agent docs are generated from `lib/markdown.ts`, not from this file.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4
- Deployed on Vercel
- MCP via [`mcp-handler`](https://github.com/vercel/mcp-handler) (streamable HTTP) at `app/mcp/route.ts`

## Source of truth

Almost all user-facing copy and machine-readable payloads render from two modules:

| Module | Owns |
| --- | --- |
| `content/resume.ts` | Resume: basics, work, education, projects, skills |
| `content/site.ts` | Site metadata, bio, social links, MCP tool catalog (`mcpTools`) |

Pages, MCP tools, markdown mirrors (`/index.md`, `/resume.md`), `llms.txt`, the public `/AGENTS.md` route, and `/.well-known/mcp.json` all derive from those modules (plus `lib/markdown.ts` for string assembly). Prefer editing content there over hardcoding strings in components or routes.

## Layout

```
app/
  page.tsx                 Home
  resume/page.tsx          Resume HTML
  mcp/route.ts             MCP server (tool registrations)
  AGENTS.md/route.ts       Public agent guide (visitors)
  index.md/, resume.md/    Markdown mirrors
  llms.txt/                LLM index
  .well-known/mcp.json/    MCP server card
  robots.ts, sitemap.ts
components/                UI (MCP connect card, tabs, copy button)
content/                   Single source of truth (see above)
lib/markdown.ts            Shared markdown / llms / agents text builders
public/                    Static assets + brody-berson-resume.pdf
scripts/
  generate-pdf.mjs         Print /resume → PDF (Playwright)
  mcp-smoke.mjs            MCP client smoke test vs localhost
```

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
npm run smoke    # MCP smoke test (server must be running)
npm run pdf      # regenerate public/brody-berson-resume.pdf (server must be running)
```

One-time for PDF generation: `npx playwright install chromium`.

## Contribution tips

### Content changes

1. Edit `content/resume.ts` and/or `content/site.ts`.
2. After resume changes, with the site running: `npm run pdf`, then commit the updated `public/brody-berson-resume.pdf`.
3. Skim home + resume pages and the markdown mirrors to confirm nothing drifted.

### MCP tools

- Register tools in `app/mcp/route.ts`.
- Keep `mcpTools` in `content/site.ts` in sync — it feeds the homepage, public AGENTS.md, and the server card. Comments in `site.ts` call this out explicitly.
- Prefer returning structured JSON from tools (or short plain text for `about`). Reuse `resume`, `site`, `socialLinks`, and `resumeMarkdown()` rather than duplicating data.
- After MCP changes, run `npm run smoke` against a local server.

### UI / design

- Match existing patterns: fonts (Fraunces / Inter / JetBrains Mono), CSS variables in `app/globals.css`, and the cream/paper/blue palette already on the site.
- Keep the first viewport focused; the MCP section is a deliberate product surface, not decorative chrome.
- Prefer small, focused changes. Do not introduce a new content system, CMS, or parallel copy sources.

### Discovery / agent surfaces

When adding a new public surface for agents or crawlers, wire it through `content/` + `lib/markdown.ts` (or the well-known route) so humans, MCP, and markdown stay aligned. Update `llmsTxt()` / `agentsMarkdown()` / `mcpTools` as needed.

### What not to do

- Do not put secrets or auth on the MCP endpoint — it is intentionally public and read-only.
- Do not edit generated visitor docs as static files under `app/`; they are route handlers that call builders in `lib/markdown.ts`.
- Do not skip regenerating the PDF after resume content changes.

## Quick mental model

```
content/*  ──►  pages (React)
           ──►  lib/markdown.ts  ──►  /index.md, /resume.md, /AGENTS.md, /llms.txt
           ──►  app/mcp/route.ts ──►  MCP tools + resources
           ──►  .well-known/mcp.json
```

Change content once; verify the surfaces that consume it.

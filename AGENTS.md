# AGENTS.md: contributing to brodyberson.com

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
- MCP via [`mcp-handler`](https://github.com/vercel/mcp-handler) v2 + `@modelcontextprotocol/server` v2 at `app/mcp/route.ts`. Serves protocol 2026-07-28 natively (stateless) and falls back to 2025-era Streamable HTTP from the same handler

## Source of truth

Almost all user-facing copy and machine-readable payloads render from two modules:

| Module | Owns |
| --- | --- |
| `content/resume.ts` | Resume: basics, work, education, projects, skills |
| `content/site.ts` | Site metadata, bio, social links, personal context (`personal`: open to / now / favorites), Letterboxd config, MCP server identity (`mcpServer`), tool and prompt catalogs (`mcpTools`, `mcpPrompts`) |

Pages, MCP tools, markdown mirrors (`/index.md`, `/resume.md`), `llms.txt`, the public `/AGENTS.md` route, and the discovery documents (`/mcp/server-card`, `/.well-known/ai-catalog.json`, `/.well-known/mcp.json`) all derive from those modules (plus `lib/markdown.ts` and `lib/discovery.ts` for assembly). Prefer editing content there over hardcoding strings in components or routes.

## Layout

```
app/
  page.tsx                 Home
  resume/page.tsx          Resume HTML
  mcp/route.ts             MCP server (tools, prompts, resources, CORS)
  mcp/server-card/         MCP Server Card (SEP-2127)
  watching.json/           Paged Letterboxd feed for the homepage shelf
  AGENTS.md/route.ts       Public agent guide (visitors)
  index.md/, resume.md/    Markdown mirrors
  llms.txt/                LLM index
  .well-known/ai-catalog.json/  AI Catalog → server card
  .well-known/mcp.json/    Legacy card location (same body as /mcp/server-card)
  robots.ts, sitemap.ts
components/                UI (MCP card, tabs, copy button, theme + playback toggles, broadcast effects, CRT portrait, color bars, VHS shelf)
content/                   Single source of truth (see above)
lib/markdown.ts            Shared markdown / llms / agents text builders
lib/discovery.ts           Server card + AI catalog builders
lib/letterboxd.ts          Letterboxd RSS fetch/parse (hourly cache), used by the homepage shelf and MCP
lib/playback.ts            Site-wide Play/Pause state (data-playback on <html>)
public/                    Static assets + brody-berson-resume.pdf
scripts/
  generate-pdf.mjs         Print /resume → PDF (Playwright)
  mcp-smoke.mjs            MCP smoke test vs localhost (2025 and 2026-07-28 clients)
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

- Register tools and prompts in `app/mcp/route.ts`. Titles and descriptions come from `mcpTools` / `mcpPrompts` in `content/site.ts` (via `tool(name)` / `prompt(name)`), which also feed the homepage, public AGENTS.md, and llms.txt. Registration order is the `tools/list` order; keep it matching `mcpTools`.
- Every tool gets the shared `readOnly` annotations. Data tools declare an `outputSchema` (zod v4) and return `structured(value)`, which sets `structuredContent` plus the same JSON as text. Plain text is fine for `about`. Reuse `resume`, `site`, `socialLinks`, and `resumeMarkdown()` rather than duplicating data.
- The server card lists identity and transport only, never tools (per SEP-2127). Bump `mcpServer.version` in `site.ts` when the tool surface changes.
- After MCP changes, run `npm run smoke` against a local server.
- Rate limiting for the public endpoint lives in the Vercel firewall (dashboard), not in code.

### UI / design

- The look is "BBTV": a mid-2000s broadcast / 16mm-scan aesthetic. Light theme is "Daytime" (saturated pastels), dark is "Primetime" (CRT blue-black glow); `data-theme` is still `light` / `dark` under the hood.
- Match existing patterns: fonts (Antonio for display, VT323 for OSD labels only, Inter for body, JetBrains Mono for code), the tokens in `app/globals.css` (`screen`, `ink`, `signal`, `glow`, `pop`, `zest`, `tang`, `peri`, `deep`), and the component classes there (`.osd`, `.title-glow`, `.gloss`, `.marker`, `.scanlines`).
- Full-screen texture (grain, scanlines, leaks, power-on, the VHS pause screen) lives in `components/broadcast-fx.tsx`; the camcorder REC / timestamp overlay in `components/camcorder-osd.tsx`. New motion must be disabled under `prefers-reduced-motion`, and nothing decorative may show in print (the resume PDF stays plain).
- Site-wide Pause sets `html[data-playback="paused"]` (remembered in localStorage, restored before first paint). CSS in `globals.css` freezes every looping animation in place; one-shot entrances (`.fade-up`, the CRT power-on) instead finish instantly so nothing is stuck mid-fade. New looping motion is covered automatically; new one-shot motion needs the same exception. Use the `paused:` Tailwind variant for paused-only styling.
- Keep the first viewport focused; the MCP section is a deliberate product surface, not decorative chrome.
- Prefer small, focused changes. Do not introduce a new content system, CMS, or parallel copy sources.

### Discovery / agent surfaces

When adding a new public surface for agents or crawlers, wire it through `content/` + `lib/markdown.ts` (or the well-known route) so humans, MCP, and markdown all match. Update `llmsTxt()` / `agentsMarkdown()` / `mcpTools` as needed.

### What not to do

- Do not put secrets or auth on the MCP endpoint. It's intentionally public and read-only.
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

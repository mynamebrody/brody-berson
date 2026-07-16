# brodyberson.com

Personal site for [Brody Berson](https://brodyberson.com) — and a native [Model Context Protocol](https://modelcontextprotocol.io) server.

Add `https://brodyberson.com/mcp` to Claude Desktop, Cursor, or any MCP client and your AI can query my resume, projects, and contact info directly. No auth, just the URL.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS v4, deployed on Vercel
- MCP server via [`mcp-handler`](https://github.com/vercel/mcp-handler) (streamable HTTP) at [`app/mcp/route.ts`](app/mcp/route.ts)
- All content — pages, MCP tools, discovery files — renders from one source: [`content/resume.ts`](content/resume.ts) and [`content/site.ts`](content/site.ts)

## For agents

- [`/AGENTS.md`](https://brodyberson.com/AGENTS.md) — agent guide
- [`/llms.txt`](https://brodyberson.com/llms.txt) — language-model index
- [`/.well-known/mcp.json`](https://brodyberson.com/.well-known/mcp.json) — MCP server card
- [`/index.md`](https://brodyberson.com/index.md) + [`/resume.md`](https://brodyberson.com/resume.md) — markdown mirrors

## Development

```bash
npm install
npm run dev          # local dev at http://localhost:3000
npm run smoke        # MCP client smoke test against localhost
npm run pdf          # regenerate public/brody-berson-resume.pdf (needs a running server)
```

After editing `content/resume.ts`, rerun `npm run pdf` (requires `npx playwright install chromium` once) and commit the regenerated PDF.

Built with the help of [Cursor](https://cursor.com).

import assert from "node:assert/strict";
import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";

const url = process.env.MCP_URL ?? "http://localhost:3000/mcp";
const origin = new URL(url).origin;

const EXPECTED_TOOLS = [
  "about",
  "get_resume",
  "get_experience",
  "search_resume",
  "get_skills",
  "get_projects",
  "download_resume",
  "get_links",
  "open_to",
  "get_now",
  "get_favorites",
  "get_recently_watched",
];

async function connect(mode) {
  const client = new Client(
    { name: "smoke-test", version: "2.0.0" },
    { versionNegotiation: { mode } }
  );
  await client.connect(new StreamableHTTPClientTransport(new URL(url)));
  return client;
}

async function run(label, mode) {
  const client = await connect(mode);
  console.log(
    `\n=== ${label}: protocol ${client.getNegotiatedProtocolVersion()} · server ${client.getServerVersion()?.name}@${client.getServerVersion()?.version}`
  );

  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name), EXPECTED_TOOLS, "tool list/order");
  for (const t of tools) {
    assert.equal(t.annotations?.readOnlyHint, true, `${t.name} readOnlyHint`);
    assert.ok(t.title, `${t.name} title`);
  }
  console.log("tools:", tools.map((t) => t.name).join(", "));

  const about = await client.callTool({ name: "about", arguments: {} });
  assert.match(about.content[0].text, /Brody Berson/);

  const resume = await client.callTool({ name: "get_resume", arguments: {} });
  assert.equal(resume.structuredContent.basics.name, "Brody Berson");
  assert.equal(JSON.parse(resume.content[0].text).basics.name, "Brody Berson");
  console.log("get_resume: work entries", resume.structuredContent.work.length);

  const zapier = await client.callTool({ name: "get_experience", arguments: { company: "zapier" } });
  assert.equal(zapier.structuredContent.work.length, 3, "three Zapier roles");
  const recent = await client.callTool({ name: "get_experience", arguments: { since: 2024 } });
  console.log("get_experience since 2024:", recent.structuredContent.work.map((w) => w.company).join(", "));

  const search = await client.callTool({ name: "search_resume", arguments: { query: "MCP" } });
  assert.ok(search.structuredContent.total > 0, "search hits for MCP");
  console.log("search_resume MCP:", search.structuredContent.total, "hits");

  const skills = await client.callTool({ name: "get_skills", arguments: {} });
  assert.ok(skills.structuredContent.skills.length > 0);

  const projects = await client.callTool({ name: "get_projects", arguments: {} });
  assert.ok(projects.structuredContent.projects.length > 0);

  const dl = await client.callTool({ name: "download_resume", arguments: {} });
  assert.ok(dl.content.some((c) => c.type === "resource_link" && c.mimeType === "application/pdf"));

  const links = await client.callTool({ name: "get_links", arguments: {} });
  assert.ok(links.structuredContent.email);

  const openTo = await client.callTool({ name: "open_to", arguments: {} });
  assert.equal(openTo.structuredContent.items.length, 3);
  const now = await client.callTool({ name: "get_now", arguments: {} });
  assert.ok(now.structuredContent.reading.length > 0);
  const favorites = await client.callTool({ name: "get_favorites", arguments: {} });
  assert.ok(favorites.structuredContent.films.includes("Donnie Darko"));

  const watched = await client.callTool({
    name: "get_recently_watched",
    arguments: { limit: 5, liked_only: true },
  });
  assert.ok(watched.structuredContent.profileUrl.includes("letterboxd.com"));
  assert.ok(watched.structuredContent.entries.length <= 5);
  assert.ok(watched.structuredContent.entries.every((f) => f.liked), "liked_only");
  console.log(
    "get_recently_watched (liked):",
    watched.structuredContent.entries.map((f) => `${f.title} ${f.rating ?? "–"}★`).join(", ")
  );

  const { prompts } = await client.listPrompts();
  assert.deepEqual(prompts.map((p) => p.name), ["assess_fit", "draft_intro"]);
  const fit = await client.getPrompt({
    name: "assess_fit",
    arguments: { job_description: "Solutions engineer working on MCP integrations" },
  });
  assert.match(fit.messages[0].content.text, /## Resume/);

  const { resources } = await client.listResources();
  const uris = resources.map((r) => r.uri);
  assert.ok(uris.some((u) => u.endsWith("/resume.md")) && uris.some((u) => u.endsWith("/index.md")));
  const read = await client.readResource({ uri: uris.find((u) => u.endsWith("/index.md")) });
  assert.match(read.contents[0].text, /^# Brody Berson/);
  console.log("prompts:", prompts.map((p) => p.name).join(", "), "· resources:", uris.length);

  await client.close();
}

await run("2025-era client", "legacy");
await run("2026-07-28 client", { pin: "2026-07-28" });

const card = await (await fetch(`${url}/server-card`)).json();
assert.equal(card.remotes[0].type, "streamable-http");
assert.ok(!("tools" in card), "server card must not list tools");
const catalog = await (await fetch(`${origin}/.well-known/ai-catalog.json`)).json();
const shelf = await (await fetch(`${origin}/watching.json?offset=6&limit=6`)).json();
assert.equal(shelf.entries.length, 6, "watching.json page");
const tail = await (await fetch(`${origin}/watching.json?offset=48&limit=6`)).json();
assert.equal(tail.done, true, "watching.json reaches the end");
assert.equal(catalog.entries[0].type, "application/mcp-server-card+json");
console.log("\nserver card, ai-catalog, watching.json OK");

console.log("\nSMOKE TEST PASSED");

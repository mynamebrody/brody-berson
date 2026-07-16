import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const url = process.env.MCP_URL ?? "http://localhost:3000/mcp";
const client = new Client({ name: "smoke-test", version: "1.0.0" });
await client.connect(new StreamableHTTPClientTransport(new URL(url)));

const { tools } = await client.listTools();
console.log("TOOLS:", tools.map((t) => t.name).join(", "));

const about = await client.callTool({ name: "about", arguments: {} });
console.log("\n--- about ---\n" + about.content[0].text.slice(0, 300));

const dl = await client.callTool({ name: "download_resume", arguments: {} });
console.log("\n--- download_resume ---\n" + dl.content[0].text);

const resume = await client.callTool({ name: "get_resume", arguments: {} });
const parsed = JSON.parse(resume.content[0].text);
console.log(
  "\n--- get_resume ---\nname:",
  parsed.basics.name,
  "| work entries:",
  parsed.work.length,
  "| first:",
  parsed.work[0].company,
  "| second:",
  `${parsed.work[1].company} (${parsed.work[1].position})`
);

const links = await client.callTool({ name: "get_links", arguments: {} });
console.log("\n--- get_links ---\n" + links.content[0].text.slice(0, 200));

await client.close();
console.log("\nSMOKE TEST PASSED");

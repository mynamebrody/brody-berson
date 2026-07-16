import { agentsMarkdown } from "@/lib/markdown";

export const dynamic = "force-static";

export function GET() {
  return new Response(agentsMarkdown(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}

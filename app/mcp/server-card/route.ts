import { discoveryHeaders, serverCard } from "@/lib/discovery";

export const dynamic = "force-static";

export function GET() {
  return Response.json(serverCard(), {
    headers: { ...discoveryHeaders, "Content-Type": "application/mcp-server-card+json" },
  });
}

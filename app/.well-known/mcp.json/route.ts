import { discoveryHeaders, serverCard } from "@/lib/discovery";

export const dynamic = "force-static";

/** Legacy location kept for crawlers that already know it; serves the same card as /mcp/server-card. */
export function GET() {
  return Response.json(serverCard(), { headers: discoveryHeaders });
}

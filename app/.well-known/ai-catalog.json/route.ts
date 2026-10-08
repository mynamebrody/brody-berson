import { aiCatalog, discoveryHeaders } from "@/lib/discovery";

export const dynamic = "force-static";

export function GET() {
  return Response.json(aiCatalog(), { headers: discoveryHeaders });
}

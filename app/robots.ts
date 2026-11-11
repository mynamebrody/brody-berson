import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /watched/details is data for the film dialog, not a page
    rules: [{ userAgent: "*", allow: "/", disallow: "/watched/details" }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}

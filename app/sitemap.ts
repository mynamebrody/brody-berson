import type { MetadataRoute } from "next";
import { absoluteUrl, pages, type SitePage } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values<SitePage>(pages).flatMap((page) =>
    page.sitemap ? [{ url: absoluteUrl(page.path), ...page.sitemap }] : [],
  );
}

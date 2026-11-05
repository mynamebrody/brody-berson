import type { Metadata } from "next";
import { site } from "@/content/site";

/**
 * Open Graph and Twitter tags for a page. A page's own `openGraph` replaces the root
 * layout's wholesale, so each page needs its own url, title, and site name here, or it
 * shares the homepage's.
 */
export function socialMetadata({
  path,
  title,
  description,
  image = "/open-graph.png",
}: {
  path: string;
  title: string;
  description: string;
  image?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      url: path,
      siteName: site.domain,
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

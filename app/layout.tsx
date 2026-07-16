import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { site } from "@/content/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.headline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  icons: {
    icon: [
      { url: "/ico/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/ico/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/ico/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: site.url,
    title: site.name,
    siteName: site.domain,
    description: site.description,
    images: ["/open-graph.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: ["/open-graph.png"],
  },
};

// Runs before first paint so the page never flashes the wrong theme.
// Reads the manual override from localStorage, falls back to system preference,
// and keeps following the system when no override is set.
const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem("theme");
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var theme = stored === "light" || stored === "dark" ? stored : (media.matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
    media.addEventListener("change", function (event) {
      if (!localStorage.getItem("theme")) {
        document.documentElement.dataset.theme = event.matches ? "dark" : "light";
      }
    });
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-29575C0GNT"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-29575C0GNT');`}
        </Script>
      </body>
    </html>
  );
}

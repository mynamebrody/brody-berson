/**
 * Prints the /resume page to public/brody-berson-resume.pdf using headless Chromium.
 *
 * Usage:
 *   1. Start the site locally (npm run dev  — or npm run build && npm run start)
 *   2. npm run pdf            [RESUME_URL=http://localhost:3000/resume to override]
 *
 * Rerun whenever content/resume.ts changes, and commit the regenerated PDF.
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const url = process.env.RESUME_URL ?? "http://localhost:3000/resume";
const outPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "brody-berson-resume.pdf"
);

try {
  await fetch(url, { method: "HEAD" });
} catch {
  console.error(`No server responding at ${url} — start one with \`npm run dev\` first.`);
  process.exit(1);
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: outPath,
    format: "Letter",
    printBackground: true,
  });
  console.log(`Wrote ${outPath}`);
} finally {
  await browser.close();
}

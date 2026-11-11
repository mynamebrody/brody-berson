/**
 * Measures what a phone pays to load and scroll the site, so a change can show
 * its effect as before/after numbers.
 *
 * Usage:
 *   1. npm run build && npm run start      (measure a production build, not dev)
 *   2. npm run perf                         [BASE_URL=http://localhost:3000 to override]
 *      npm run perf -- --shots              also saves screenshots to .perf/shots/
 *      npm run perf -- --shots --diff=DIR   and compares them, pixel by pixel, with an
 *                                           earlier set (copy .perf/shots somewhere first)
 *
 * Per page it reports:
 *   - payload: HTML and RSC flight bytes (raw and gzip), <dialog> count, image preloads
 *   - load (390px phone, 4x CPU throttle): DOM nodes, image requests and bytes
 *     before any scroll, and the compositor's layers (count and total area) once
 *     the page has settled
 *   - scroll (same phone): p95 frame time and slow frames over a 5s scroll, in
 *     both themes
 *
 * Screenshots are taken with the site paused and the clock held at a fixed time,
 * so frames are deterministic and two runs can be diffed: both themes, 390px and
 * 1280px wide.
 *
 * Results also go to .perf/latest.json. Without TMDB_API_KEY the film dialogs
 * carry no trailers, so payload numbers are smaller than production.
 */
import { chromium } from "playwright";
import { gzipSync } from "node:zlib";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const base = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const shots = process.argv.includes("--shots");
const diffDir = process.argv.find((arg) => arg.startsWith("--diff="))?.slice("--diff=".length);
const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".perf");

const PAGES = ["/", "/watched"];
const THEMES = ["light", "dark"];
const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };
const CPU_THROTTLE = 4;
const SCROLL_MS = 5000;
const SCROLL_STEP = 40; // px per frame
const SLOW_FRAME_MS = 20;
// The camcorder clock is on screen at 1280px; hold it still for screenshots
const SHOT_TIME = new Date("2026-01-01T12:00:00");

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const count = (text, pattern) => (text.match(pattern) ?? []).length;
const slug = (page) => (page === "/" ? "home" : page.slice(1).replaceAll("/", "-"));

try {
  const res = await fetch(base, { method: "HEAD" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
} catch (error) {
  console.error(`No server responding at ${base} (${error.message}). Run \`npm run build && npm run start\` first.`);
  process.exit(1);
}

/** HTML and RSC payload, as served. */
async function payload(page) {
  const html = await (await fetch(base + page)).text();
  const rsc = await (await fetch(base + page, { headers: { RSC: "1" } })).text();
  return {
    htmlBytes: Buffer.byteLength(html),
    htmlGzipBytes: gzipSync(html).length,
    rscBytes: Buffer.byteLength(rsc),
    rscGzipBytes: gzipSync(rsc).length,
    dialogs: count(html, /<dialog[\s>]/g),
    imagePreloads: count(html, /<link[^>]+rel="preload"[^>]+as="image"/g),
  };
}

/** A phone-sized context with the theme (and optionally Pause) set before first paint. */
async function openPage(browser, page, { viewport, theme, paused = false, mobile = true }) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: mobile ? 3 : 1,
    isMobile: mobile,
    hasTouch: mobile,
    colorScheme: theme,
  });
  await context.addInitScript(
    ([theme, paused]) => {
      localStorage.setItem("theme", theme);
      if (paused) localStorage.setItem("playback", "paused");
    },
    [theme, paused],
  );
  const tab = await context.newPage();
  if (mobile) {
    const cdp = await context.newCDPSession(tab);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_THROTTLE });
  }
  return { context, tab, url: base + page };
}

/** What the first view costs before the visitor scrolls. */
async function load(browser, page) {
  const { context, tab, url } = await openPage(browser, page, { viewport: PHONE, theme: "light" });
  let imageRequests = 0;
  let imageBytes = 0;
  const sizes = [];
  tab.on("response", (response) => {
    if (response.request().resourceType() !== "image") return;
    imageRequests += 1;
    sizes.push(
      response
        .body()
        .then((body) => (imageBytes += body.length))
        .catch(() => {}),
    );
  });
  const cdp = await context.newCDPSession(tab);
  let layers = [];
  cdp.on("LayerTree.layerTreeDidChange", (event) => {
    if (event.layers) layers = event.layers;
  });
  await cdp.send("LayerTree.enable");
  await tab.goto(url, { waitUntil: "networkidle" });
  await Promise.all(sizes);
  const domNodes = await tab.evaluate(() => document.querySelectorAll("*").length);
  // Past the power-on and the entrance fades, so only the standing layers are counted
  await tab.waitForTimeout(1500);
  const drawn = layers.filter((layer) => layer.drawsContent);
  const layerPixels = drawn.reduce((sum, layer) => sum + layer.width * layer.height, 0);
  await context.close();
  return {
    domNodes,
    imageRequests,
    imageBytes,
    layers: drawn.length,
    // In CSS pixels, as a multiple of one phone screen
    layerScreens: Number((layerPixels / (PHONE.width * PHONE.height)).toFixed(1)),
  };
}

/** Frame times while scrolling down at a steady rate. */
async function scroll(browser, page, theme) {
  const { context, tab, url } = await openPage(browser, page, { viewport: PHONE, theme });
  await tab.goto(url, { waitUntil: "networkidle" });
  // Let the power-on and the entrance fades finish so they aren't measured
  await tab.waitForTimeout(1500);
  const frames = await tab.evaluate(
    ([duration, step]) =>
      new Promise((resolve) => {
        document.documentElement.style.scrollBehavior = "auto";
        const times = [];
        const start = performance.now();
        let last = start;
        let direction = 1;
        function tick(now) {
          times.push(now - last);
          last = now;
          const max = document.documentElement.scrollHeight - innerHeight;
          if (scrollY >= max) direction = -1;
          if (scrollY <= 0) direction = 1;
          scrollBy(0, step * direction);
          if (now - start < duration) requestAnimationFrame(tick);
          else resolve(times.slice(1));
        }
        requestAnimationFrame(tick);
      }),
    [SCROLL_MS, SCROLL_STEP],
  );
  await context.close();
  const sorted = [...frames].sort((a, b) => a - b);
  return {
    frames: frames.length,
    p95FrameMs: Number(sorted[Math.floor(sorted.length * 0.95)].toFixed(1)),
    slowFrames: frames.filter((ms) => ms > SLOW_FRAME_MS).length,
  };
}

async function screenshot(browser, page, theme, viewport, mobile) {
  const { context, tab, url } = await openPage(browser, page, { viewport, theme, paused: true, mobile: false });
  await tab.clock.setFixedTime(SHOT_TIME);
  await tab.goto(url, { waitUntil: "networkidle" });
  await tab.evaluate(() => document.fonts.ready);
  const file = path.join(outDir, "shots", `${slug(page)}-${theme}-${viewport.width}.png`);
  await tab.screenshot({ path: file, fullPage: !mobile });
  await context.close();
  return file;
}

/**
 * Compare this run's screenshots with an earlier set, in a browser canvas (no image
 * library needed). Reports how many pixels differ at all and the largest difference
 * in any channel, out of 255.
 */
async function diffShots(browser, before) {
  const after = path.join(outDir, "shots");
  const tab = await browser.newPage();
  const report = {};
  for (const file of (await readdir(after)).filter((name) => name.endsWith(".png")).sort()) {
    let pair;
    try {
      pair = await Promise.all([before, after].map(async (dir) => (await readFile(path.join(dir, file))).toString("base64")));
    } catch {
      report[file] = { missing: true };
      continue;
    }
    report[file] = await tab.evaluate(async (pair) => {
      const [a, b] = await Promise.all(
        pair.map(async (data) => createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob())),
      );
      if (a.width !== b.width || a.height !== b.height) {
        return { sizeChanged: `${a.width}x${a.height} -> ${b.width}x${b.height}` };
      }
      const pixels = (image) => {
        const context = new OffscreenCanvas(image.width, image.height).getContext("2d");
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, image.width, image.height).data;
      };
      const [x, y] = [pixels(a), pixels(b)];
      let changed = 0;
      let visible = 0;
      let maxDelta = 0;
      for (let i = 0; i < x.length; i += 4) {
        const delta = Math.max(Math.abs(x[i] - y[i]), Math.abs(x[i + 1] - y[i + 1]), Math.abs(x[i + 2] - y[i + 2]));
        if (delta > 0) changed += 1;
        if (delta > 2) visible += 1;
        if (delta > maxDelta) maxDelta = delta;
      }
      const total = x.length / 4;
      return { changedPct: (changed / total) * 100, over2Pct: (visible / total) * 100, maxDelta };
    }, pair);
  }
  await tab.close();
  return report;
}

await mkdir(path.join(outDir, "shots"), { recursive: true });
const browser = await chromium.launch();
const results = {};
try {
  for (const page of PAGES) {
    const entry = { payload: await payload(page), load: await load(browser, page), scroll: {} };
    for (const theme of THEMES) entry.scroll[theme] = await scroll(browser, page, theme);
    results[page] = entry;

    const { payload: p, load: l } = entry;
    console.log(`\n${page}`);
    console.log(`  html     ${kb(p.htmlBytes)} (${kb(p.htmlGzipBytes)} gzip)`);
    console.log(`  rsc      ${kb(p.rscBytes)} (${kb(p.rscGzipBytes)} gzip)`);
    console.log(`  dialogs  ${p.dialogs}   image preloads ${p.imagePreloads}`);
    console.log(`  load     ${l.domNodes} DOM nodes, ${l.imageRequests} images (${kb(l.imageBytes)}) before scroll`);
    console.log(`  layers   ${l.layers} drawn, ${l.layerScreens} phone screens of pixels`);
    for (const theme of THEMES) {
      const s = entry.scroll[theme];
      console.log(`  scroll   ${theme.padEnd(5)} p95 ${s.p95FrameMs} ms, ${s.slowFrames}/${s.frames} frames over ${SLOW_FRAME_MS} ms`);
    }

    if (shots) {
      for (const theme of THEMES) {
        await screenshot(browser, page, theme, PHONE, true);
        await screenshot(browser, page, theme, DESKTOP, false);
      }
    }
  }
  if (shots && diffDir) {
    results.diff = await diffShots(browser, path.resolve(diffDir));
    console.log(`\nscreenshots vs ${diffDir}`);
    for (const [file, d] of Object.entries(results.diff)) {
      const line = d.missing
        ? "no earlier screenshot"
        : d.sizeChanged
          ? `size changed (${d.sizeChanged})`
          : d.maxDelta === 0
            ? "identical"
            : `${d.changedPct.toFixed(2)}% of pixels differ (${d.over2Pct.toFixed(2)}% by more than 2/255), largest difference ${d.maxDelta}/255`;
      console.log(`  ${file.padEnd(26)} ${line}`);
    }
  }
} finally {
  await browser.close();
}

await writeFile(path.join(outDir, "latest.json"), JSON.stringify(results, null, 2) + "\n");
console.log(`\nWrote ${path.join(outDir, "latest.json")}${shots ? " and screenshots in .perf/shots/" : ""}`);

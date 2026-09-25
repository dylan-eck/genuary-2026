// Captures a thumbnail of each day's sketch into src/previews/.
//
// Usage:
//   node tools/capture_previews.mjs          # all days
//   node tools/capture_previews.mjs 07 20    # specific days
//
// Per-day seeds and wait times live in tools/previews.json. Days without a
// seed get a random one, which is printed so it can be pinned in the config.
// Requires Google Chrome and ImageMagick (`magick`).

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");
const OUT = join(SRC, "previews");
const CONFIG = JSON.parse(
  readFileSync(join(ROOT, "tools/previews.json"), "utf8"),
);

const THUMB_W = 400;
const THUMB_H = 500;
const BACKGROUND = "none"; // transparent padding

// First match wins: SVG sketches render into a div, day 13 is an image, and
// day 28 is an iframe.
const ARTWORK_SELECTORS = [
  "main > div",
  "main > canvas",
  "main > img",
  "main > iframe",
];

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".glsl": "text/plain",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
};

function startServer() {
  const server = createServer((req, res) => {
    let path = normalize(
      decodeURIComponent(new URL(req.url, "http://x").pathname),
    );
    if (path.endsWith("/")) path += "index.html";
    const file = join(SRC, path);
    if (!file.startsWith(SRC) || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extname(file)] ?? "application/octet-stream",
    });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

async function findArtwork(page) {
  for (const selector of ARTWORK_SELECTORS) {
    const el = await page.$(selector);
    if (el && (await el.boundingBox())?.width > 0) return el;
  }
  throw new Error("no artwork element found");
}

function toThumbnail(png, outFile) {
  execFileSync(
    "magick",
    [
      "png:-",
      "-resize",
      `${THUMB_W}x${THUMB_H}`,
      "-background",
      BACKGROUND,
      "-gravity",
      "center",
      "-extent",
      `${THUMB_W}x${THUMB_H}`,
      "-quality",
      "82",
      outFile,
    ],
    { input: png },
  );
}

// Extra time allowed beyond a day's waitMs before giving up on it. Some page
// calls have no timeout of their own and hang if a sketch freezes the tab.
const TIMEOUT_MARGIN_MS = 30000;

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function capture(browser, baseUrl, day) {
  const { seed, waitMs = CONFIG.defaults.waitMs } = CONFIG.days[day] ?? {};
  const page = await browser.newPage({
    // Tall enough that the 75vh max-height never shrinks a 1920px canvas.
    viewport: { width: 1600, height: 2800 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  try {
    const usedSeed = await withTimeout(
      screenshotDay(page, baseUrl, day, seed, waitMs),
      waitMs + TIMEOUT_MARGIN_MS,
    );
    return { usedSeed, errors };
  } finally {
    // A frozen tab can also stall close(), so don't wait on it forever.
    await withTimeout(page.close(), 5000).catch(() => {});
  }
}

async function screenshotDay(page, baseUrl, day, seed, waitMs) {
  const query = seed === undefined ? "" : `?seed=${seed}`;
  await page.goto(`${baseUrl}/${day}/${query}`, { waitUntil: "load" });
  await page.waitForTimeout(waitMs);

  // An element screenshot rounds its fractional page position outward and
  // picks up a row of page background, so clip to the snapped pixel box.
  const artwork = await findArtwork(page);
  const box = await artwork.boundingBox();
  const png = await page.screenshot({
    type: "png",
    clip: {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
    },
  });
  toThumbnail(png, join(OUT, `${day}.webp`));

  return new URL(page.url()).searchParams.get("seed") ?? "-";
}

const allDays = readdirSync(SRC)
  .filter((d) => /^\d\d$/.test(d))
  .sort();
const days = process.argv.length > 2 ? process.argv.slice(2) : allDays;

mkdirSync(OUT, { recursive: true });
const server = await startServer();
const baseUrl = `http://localhost:${server.address().port}`;
const browser = await chromium.launch({ channel: "chrome" });

try {
  for (const day of days) {
    // Print the day first so a slow or stuck day is visible while it runs.
    process.stdout.write(`${day}  `);
    try {
      const { usedSeed, errors } = await capture(browser, baseUrl, day);
      const pinned = CONFIG.days[day]?.seed !== undefined ? "" : " (random)";
      console.log(`seed ${usedSeed}${pinned}`);
      for (const e of errors) console.log(`    page error: ${e}`);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
    }
  }
} finally {
  await browser.close();
  server.close();
}

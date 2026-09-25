// Builds the social preview image (src/social.jpg) from the thumbnails in
// src/previews/. The 10 days to include, in reading order, are listed under
// "social" in tools/previews.json. Run capture_previews.mjs first.
//
// Usage:
//   node tools/make_social.mjs
//
// Requires ImageMagick (`magick`).

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PREVIEWS = join(ROOT, "src/previews");
const OUT = join(ROOT, "src/social.jpg");
const CONFIG = JSON.parse(
  readFileSync(join(ROOT, "tools/previews.json"), "utf8"),
);

// 2 rows of 5 tiles at 4:5 fill 1280x640 exactly, so no tile is cropped.
// Gutters go between tiles only, since an outer border gets unevenly cropped
// by platforms that display link previews at 1.91:1.
const COLS = 5;
const ROWS = 2;
const TILE_W = 256;
const TILE_H = 320;
const GUTTER = 2;
const GUTTER_COLOR = "#8a8a8a";
const BACKGROUND = "#1c1c1c";
const MAX_BYTES = 1024 * 1024; // GitHub's upload limit

const days = CONFIG.social ?? [];
if (days.length !== COLS * ROWS) {
  console.error(`"social" in previews.json needs ${COLS * ROWS} days`);
  process.exit(1);
}
for (const day of days) {
  if (!existsSync(join(PREVIEWS, `${day}.webp`))) {
    console.error(`missing src/previews/${day}.webp`);
    process.exit(1);
  }
}

// Thumbnails that aren't 4:5 have transparent padding. Find the opaque area
// from the alpha channel so the padding is cropped away before the tile is
// cover-cropped to fill its cell.
function opaqueArea(file) {
  const magick = (...args) =>
    execFileSync("magick", [file, ...args, "info:"], { encoding: "utf8" });
  if (magick("-format", "%[opaque]") === "True") return null;
  // %@ is the bounding box a -trim would keep.
  return magick("-alpha", "extract", "-format", "%@");
}

function tileArgs(day) {
  const file = join(PREVIEWS, `${day}.webp`);
  const area = opaqueArea(file);
  return [
    "(",
    file,
    // Reset gravity left over from the previous tile so the crop offset is
    // measured from the top left.
    "+gravity",
    ...(area ? ["-crop", area, "+repage"] : []),
    "-resize",
    `${TILE_W}x${TILE_H}^`,
    "-gravity",
    "center",
    "-extent",
    `${TILE_W}x${TILE_H}`,
    ")",
  ];
}

const rowArgs = [];
for (let r = 0; r < ROWS; r++) {
  const rowDays = days.slice(r * COLS, (r + 1) * COLS);
  rowArgs.push("(", ...rowDays.flatMap(tileArgs), "+append", ")");
}

// Gutter bars centered on each boundary between tiles.
const half = GUTTER / 2;
const gutters = [];
for (let c = 1; c < COLS; c++) {
  const x = c * TILE_W;
  gutters.push(`rectangle ${x - half},0 ${x + half - 1},${ROWS * TILE_H - 1}`);
}
for (let r = 1; r < ROWS; r++) {
  const y = r * TILE_H;
  gutters.push(`rectangle 0,${y - half} ${COLS * TILE_W - 1},${y + half - 1}`);
}

execFileSync("magick", [
  ...rowArgs,
  "-append",
  "+repage",
  "-background",
  BACKGROUND,
  "-alpha",
  "remove",
  "-fill",
  GUTTER_COLOR,
  ...gutters.flatMap((g) => ["-draw", g]),
  "-quality",
  "88",
  OUT,
]);

const bytes = statSync(OUT).size;
console.log(`wrote src/social.jpg (${Math.round(bytes / 1024)} KB)`);
if (bytes > MAX_BYTES) {
  console.warn("warning: over GitHub's 1 MB limit for social previews");
}

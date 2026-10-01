// Builds the README thumbnails (.github/readme-thumbs/) from the thumbnails in
// src/previews/. The transparent padding that makes every preview 4:5 is
// cropped away, and each thumbnail is scaled to the same height, so the README
// grid keeps each artwork's own aspect ratio. Each thumbnail gets a thin gray
// frame so light-edged pieces don't blend into GitHub's light theme. Run
// capture_previews.mjs first.
//
// Usage:
//   node tools/make_readme_thumbs.mjs
//
// Requires ImageMagick (`magick`).

import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PREVIEWS = join(ROOT, "src/previews");
const OUT = join(ROOT, ".github/readme-thumbs");

// Twice the height the README displays them at, for high-density screens.
const THUMB_H = 300;

// Frame drawn inside each thumbnail (2px here is 1px as displayed), so the
// sizes the README spacing is tuned for don't change. The color is GitHub's
// light-theme border gray.
const FRAME_PX = 2;
const FRAME_COLOR = "#d0d7de";

// Find the opaque area from the alpha channel, or null if there's no padding.
function opaqueArea(file) {
  const magick = (...args) =>
    execFileSync("magick", [file, ...args, "info:"], { encoding: "utf8" });
  if (magick("-format", "%[opaque]") === "True") return null;
  // %@ is the bounding box a -trim would keep.
  return magick("-alpha", "extract", "-format", "%@");
}

mkdirSync(OUT, { recursive: true });

const files = readdirSync(PREVIEWS)
  .filter((f) => /^\d\d\.webp$/.test(f))
  .sort();

for (const name of files) {
  const file = join(PREVIEWS, name);
  const area = opaqueArea(file);
  execFileSync("magick", [
    file,
    ...(area ? ["-crop", area, "+repage"] : []),
    "-resize",
    `x${THUMB_H}`,
    "-shave",
    `${FRAME_PX}x${FRAME_PX}`,
    "-bordercolor",
    FRAME_COLOR,
    "-border",
    `${FRAME_PX}x${FRAME_PX}`,
    "-quality",
    "82",
    join(OUT, name),
  ]);
  console.log(name);
}

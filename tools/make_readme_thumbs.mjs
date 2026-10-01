// Builds the README thumbnails (.github/readme-thumbs/) from the thumbnails in
// src/previews/. The transparent padding that makes every preview 4:5 is
// cropped away, and each thumbnail is scaled to the same height, so the README
// grid keeps each artwork's own aspect ratio. Thumbnails whose edges are light
// get a thin gray frame so they don't blend into GitHub's light theme. Run
// capture_previews.mjs first.
//
// Usage:
//   node tools/make_readme_thumbs.mjs
//
// Requires ImageMagick (`magick`).

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PREVIEWS = join(ROOT, "src/previews");
const OUT = join(ROOT, ".github/readme-thumbs");

// Twice the height the README displays them at, for high-density screens.
const THUMB_H = 300;

// Frame drawn inside light-edged thumbnails (2px here is 1px as displayed), so
// the sizes the README spacing is tuned for don't change. The color is
// GitHub's light-theme border gray.
const FRAME_PX = 2;
const FRAME_COLOR = "#d0d7de";
// Mean brightness (0-1) of the outer edge above which a thumbnail is framed.
const LIGHT_EDGE = 0.85;

// Find the opaque area from the alpha channel, or null if there's no padding.
function opaqueArea(file) {
  const magick = (...args) =>
    execFileSync("magick", [file, ...args, "info:"], { encoding: "utf8" });
  if (magick("-format", "%[opaque]") === "True") return null;
  // %@ is the bounding box a -trim would keep.
  return magick("-alpha", "extract", "-format", "%@");
}

// Mean brightness (0-1) of the outermost pixel ring. Differencing the image
// with a copy whose ring is painted black leaves only the ring, so the mean of
// the result scaled by area / ring length is the ring's mean.
function edgeBrightness(file) {
  const [w, h, mean] = execFileSync(
    "magick",
    [
      file,
      "-alpha",
      "off",
      "-colorspace",
      "gray",
      "(",
      "+clone",
      "-shave",
      "1x1",
      "-bordercolor",
      "black",
      "-border",
      "1x1",
      ")",
      "-compose",
      "difference",
      "-composite",
      "-format",
      "%w %h %[fx:mean]",
      "info:",
    ],
    { encoding: "utf8" },
  )
    .split(" ")
    .map(Number);
  return (mean * w * h) / (2 * (w + h) - 4);
}

mkdirSync(OUT, { recursive: true });

const files = readdirSync(PREVIEWS)
  .filter((f) => /^\d\d\.webp$/.test(f))
  .sort();

// Intermediate resized images. They go through a file rather than stdin
// because magick hangs reading a large PNG from a pipe.
const TMP = mkdtempSync(join(tmpdir(), "readme-thumbs-"));

try {
  for (const name of files) {
    const file = join(PREVIEWS, name);
    const area = opaqueArea(file);
    // Resize to a lossless PNG first so the edge check sees the final pixels
    // and the WebP is only encoded once.
    const png = join(TMP, "resized.png");
    execFileSync("magick", [
      file,
      ...(area ? ["-crop", area, "+repage"] : []),
      "-resize",
      `x${THUMB_H}`,
      png,
    ]);
    const framed = edgeBrightness(png) > LIGHT_EDGE;
    const frame = [
      "-shave",
      `${FRAME_PX}x${FRAME_PX}`,
      "-bordercolor",
      FRAME_COLOR,
      "-border",
      `${FRAME_PX}x${FRAME_PX}`,
    ];
    execFileSync("magick", [
      png,
      ...(framed ? frame : []),
      "-quality",
      "82",
      join(OUT, name),
    ]);
    console.log(framed ? `${name}  framed` : name);
  }
} finally {
  rmSync(TMP, { recursive: true, force: true });
}

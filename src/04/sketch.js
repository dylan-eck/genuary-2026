// Genuary 2026 day 4
//
// Prompt: "Lowres. An image or graphic with low resolution,
// where details are simplified or pixelated."

export default function sketch(p, seed) {
  // grid dimensions in cells, not pixels
  const WIDTH = 20;
  const HEIGHT = 25;
  const CANVAS_WIDTH = 400;
  const SCALE = CANVAS_WIDTH / WIDTH;
  const MARGIN = 20;

  let palette;

  p.setup = () => {
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.createCanvas(WIDTH * SCALE + 2 * MARGIN, HEIGHT * SCALE + 2 * MARGIN);

    palette = createPalette();

    p.noLoop();
  };

  p.draw = () => {
    p.background(255);

    p.noStroke();
    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        const noiseFreq = 0.1;
        const noiseVal = p.noise(noiseFreq * x, noiseFreq * y);
        const idx = p.floor(p.map(noiseVal, 0, 1, 0, palette.length));

        p.fill(p.color(palette[idx]));
        p.rect(MARGIN + x * SCALE, MARGIN + y * SCALE, SCALE, SCALE);
      }
    }
  };

  p.keyPressed = () => {
    if (p.key === "s" || p.key === "S") {
      p.saveCanvas("out", "png");
    }
  };

  // the color palette is created by interpolating between a random color and
  // is complement in the oklch color space
  function createPalette() {
    const colorA = {
      mode: "oklch",
      l: 0.4,
      c: 0.1,
      h: p.random(360),
    };

    const hueShift = 180;
    const colorB = {
      ...colorA,
      l: colorA.l + 0.2,
      h: (colorA.h + hueShift) % 360,
    };

    const gradient = culori.interpolate([colorA, colorB], "oklch");
    const numColors = p.floor(p.random(4, 16));
    return culori.samples(numColors).map(gradient).map(culori.formatHex);
  }
}

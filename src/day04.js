export default function day04(p) {
  const WIDTH = 20;
  const HEIGHT = 25;
  const CANVAS_WIDTH = 400;
  const SCALE = CANVAS_WIDTH / WIDTH;
  const MARGIN = 20;

  let gradient;
  let palette;
  let numColors;

  p.setup = () => {
    p.createCanvas(WIDTH * SCALE + 2 * MARGIN, HEIGHT * SCALE + 2 * MARGIN);

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
      h: (((colorA.h + hueShift) % 360) + 360) % 360,
    };

    gradient = culori.interpolate([colorA, colorB], "oklch");

    numColors = p.floor(p.random(4, 16));
    palette = culori.samples(numColors).map(gradient).map(culori.formatHex);

    p.noLoop();
  };

  p.draw = () => {
    p.background(255);

    p.noStroke();
    for (let x = 0; x < WIDTH; x++) {
      for (let y = 0; y < HEIGHT; y++) {
        const f = 0.1;
        const n = p.noise(f * x, f * y);
        const idx = p.floor(p.map(n, 0, 1, 0, palette.length));

        p.fill(p.color(palette[idx]));
        p.rect(
          MARGIN + x * SCALE,
          MARGIN + y * SCALE,
          p.width / WIDTH,
          p.height / HEIGHT
        );
      }
    }
  };

  p.keyPressed = () => {
    if (p.key === "s" || p.key === "S") {
      p.saveCanvas("out", "png");
    }
  };
}

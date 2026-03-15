export default function sketch(p, seed) {
  const APPLY_WARP = true;
  const MARGIN = 40;

  let buffer, warpShader, bgShader, palette;
  let loading = true;

  async function load() {
    const [warp, bg] = await Promise.all([
      p.loadShader("../shaders/quad.vert.glsl", "../shaders/warp.frag.glsl"),
      p.loadShader("../shaders/quad.vert.glsl", "../shaders/bg.frag.glsl"),
    ]);

    warpShader = warp;
    bgShader = bg;
    loading = false;
  }

  p.setup = () => {
    load();

    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.createCanvas(1080, 1350, p.WEBGL);

    const colors = [
      ["#1463a3", "#44dbd4"],
      ["#eb1e00", "#eded1F"],
      ["#771894", "#002280"],
      ["#18d997", "#00ebd9"],
    ];

    const gradient = culori.interpolate(p.random(colors), "oklch");
    palette = culori.samples(5).map(gradient).map(culori.formatHex);

    buffer = p.createFramebuffer();

    buffer.begin();
    p.clear();
    p.noStroke();

    for (let i = 0; i < 200; i++) {
      const c = p.color(p.random(palette));
      c.setAlpha(200);

      p.fill(c);

      const n = p.random(3, 32);
      const baseRadius = 2 * n;

      const centerX = p.randomGaussian(0, p.width / 8);
      const centerY = p.randomGaussian(0, p.height / 8);

      const dev = 2;
      p.beginShape();
      for (let i = 0; i < n; i++) {
        const r = p.randomGaussian(baseRadius, 0.1 * baseRadius);
        const theta = p.randomGaussian(
          p.lerp(0, p.TWO_PI, i / n),
          p.PI / (2 * n),
        );
        let x = centerX + p.randomGaussian(r * p.cos(theta), dev);
        x = p.constrain(x, -p.width / 2, p.width / 2);

        let y = centerY + p.randomGaussian(r * p.sin(theta), dev);
        y = p.constrain(y, -p.height / 2, p.height / 2);

        p.vertex(x, y);
      }
      p.endShape(p.CLOSE);
    }

    buffer.end();
  };

  p.draw = () => {
    if (loading) {
      p.clear();
      return;
    }

    p.noStroke();
    p.fill("white");
    p.rect(-p.width / 2, -p.height / 2, p.width, p.height);

    p.shader(bgShader);
    p.rect(
      -p.width / 2 + MARGIN,
      -p.height / 2 + MARGIN,
      p.width - 2 * MARGIN,
      p.height - 2 * MARGIN,
    );

    if (APPLY_WARP) {
      p.shader(warpShader);
      warpShader.setUniform("u_time", p.millis() / 1000);
      warpShader.setUniform("u_resolution", [p.width, p.height]);
      warpShader.setUniform("u_canvas", buffer);
      p.plane(p.width, p.height);
    } else {
      p.image(buffer, -p.width / 2, -p.height / 2, p.width, p.height);
    }
  };
}

export default function sketch(p, seed) {
  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1920;
  const SCALE = 1 / 2;
  const DOMAIN_WIDTH = CANVAS_WIDTH * SCALE;
  const DOMAIN_HEIGHT = CANVAS_HEIGHT * SCALE;

  const RECORD_FRAME_COUNT = 60 * 60;

  let caShader, dispShader;
  let currFrame, prevFrame, dispFrame;
  let palette = [];
  let loading = true;

  async function load() {
    const [ca, disp] = await Promise.all([
      p.loadShader("../shaders/ca_quad.vert.glsl", "../shaders/mnca.frag.glsl"),
      p.loadShader(
        "../shaders/ca_quad.vert.glsl",
        "../shaders/mnca_disp.frag.glsl",
      ),
    ]);

    caShader = ca;
    dispShader = disp;
    loading = false;
  }

  p.setup = () => {
    load();

    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, p.WEBGL);

    const hueShift = 0.61803398875;
    const N = 32;

    for (let i = 0; i < N; i++) {
      const h = (i * hueShift) % 1.0;
      const s = 0.5 + 0.2 * Math.random();
      const v = 0.6 + 0.2 * Math.random();

      const color = { mode: "hsv", h: h * 360, s: s, v: v };
      const rgb = culori.rgb(color);

      palette.push(rgb.r, rgb.g, rgb.b);
    }

    prevFrame = p.createFramebuffer({
      width: DOMAIN_WIDTH,
      height: DOMAIN_HEIGHT,
      textureFiltering: p.NEAREST,
      depth: false,
    });

    currFrame = p.createFramebuffer({
      width: DOMAIN_WIDTH,
      height: DOMAIN_HEIGHT,
      textureFiltering: p.NEAREST,
      depth: false,
    });

    dispFrame = p.createFramebuffer({
      width: DOMAIN_WIDTH,
      height: DOMAIN_HEIGHT,
      textureFiltering: p.NEAREST,
      depth: false,
    });

    prevFrame.loadPixels();

    const r = 20;
    const d = prevFrame.pixelDensity();
    const logicalW = prevFrame.width;
    const logicalH = prevFrame.height;
    const denseW = logicalW * d;
    const denseH = logicalH * d;
    const numPixels = 4 * denseW * denseH;

    for (let i = 0; i < numPixels; i += 4) {
      const k = i / 4;
      const denseX = k % denseW;
      const denseY = p.floor(k / denseW);

      const logicalX = p.floor(denseX / d);
      const logicalY = p.floor(denseY / d);

      const dx = logicalX - logicalW / 2;
      const dy = logicalY - logicalH / 2;
      const dist = p.sqrt(dx * dx + dy * dy);

      if (dist > r) continue;

      const v = p.random(255);

      prevFrame.pixels[i + 0] = v;
      prevFrame.pixels[i + 1] = 255;
      prevFrame.pixels[i + 2] = 0;
      prevFrame.pixels[i + 3] = 255;
    }

    prevFrame.updatePixels();
  };

  p.draw = () => {
    if (loading) {
      p.clear();
      return;
    }

    currFrame.begin();
    p.noStroke();
    p.shader(caShader);
    caShader.setUniform("u_prev_frame", prevFrame);
    p.plane(p.width, p.height);
    currFrame.end();

    [prevFrame, currFrame] = [currFrame, prevFrame];

    dispFrame.begin();
    p.noStroke();
    p.shader(dispShader);
    dispShader.setUniform("u_ca_state", currFrame);
    dispShader.setUniform("u_palette", palette);
    p.plane(p.width, p.height);
    dispFrame.end();

    p.image(dispFrame, -p.width / 2, -p.height / 2, p.width, p.height);
  };
}

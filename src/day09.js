export default function day09(p) {
  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1920;
  const SCALE = 1 / 16;
  const DOMAIN_WIDTH = CANVAS_WIDTH * SCALE;
  const DOMAIN_HEIGHT = CANVAS_HEIGHT * SCALE;

  const RECORD_FRAME_COUNT = 60 * 15;

  let caShader, dispShader;
  let currFrame, prevFrame, dispFrame;
  let palette = [];

  p.preload = () => {
    caShader = p.loadShader(
      "./src/shaders/ca_quad.vert.glsl",
      "./src/shaders/ca.frag.glsl"
    );
    dispShader = p.loadShader(
      "./src/shaders/ca_quad.vert.glsl",
      "./src/shaders/disp.frag.glsl"
    );
  };

  p.setup = () => {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, p.WEBGL);
    p.frameRate(16);

    // Generate palette
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

    prevFrame.begin();
    p.background(0);
    prevFrame.end();
  };

  p.draw = () => {
    currFrame.begin();
    p.noStroke();
    p.shader(caShader);
    caShader.setUniform("u_prev_frame", prevFrame);
    p.plane(p.width, p.height);
    currFrame.end();

    // Swap
    [prevFrame, currFrame] = [currFrame, prevFrame];

    dispFrame.begin();
    p.noStroke();
    p.shader(dispShader);
    dispShader.setUniform("u_ca_state", currFrame);
    dispShader.setUniform("u_palette", palette);
    p.plane(p.width, p.height);
    dispFrame.end();

    p.image(dispFrame, -p.width / 2, -p.height / 2, p.width, p.height);

    // if (p.frameCount <= RECORD_FRAME_COUNT) {
    //   p.save(p.nf(p.frameCount, 4) + ".png");
    // } else {
    //   p.noLoop();
    // }
  };
}

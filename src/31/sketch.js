export default function sketch(p, seed) {
  const LOOP_FRAME_COUNT = 30 * 60;
  const FRAME_RATE = 60;

  let sh;
  let t = 0;
  let loading = true;

  function load() {
    sh = p.loadShader(
      "../shaders/quad.vert.glsl",
      "../shaders/day31.frag.glsl",
      () => {
        loading = false;
      },
    );
  }

  p.setup = () => {
    load();

    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.createCanvas(1080, 1920, p.WEBGL);
    // p.frameRate(2);
    p.noStroke();
  };

  p.draw = () => {
    if (loading) {
      p.clear();
      return;
    }

    t = (p.frameCount % LOOP_FRAME_COUNT) / LOOP_FRAME_COUNT;

    p.shader(sh);
    sh.setUniform("uResolution", [p.width, p.height]);
    sh.setUniform("uTime", t);

    p.scale(1, -1);

    p.plane(p.width, p.height);
  };
}

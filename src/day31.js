export default function day31(p) {
  const LOOP_FRAME_COUNT = 30 * 60;
  const FRAME_RATE = 60;

  let sh;
  let t = 0;

  p.preload = () => {
    sh = p.loadShader(
      "./src/shaders/quad.vert.glsl",
      "./src/shaders/day31.frag.glsl",
    );
  };

  p.setup = () => {
    p.createCanvas(1080, 1920, p.WEBGL);
    p.frameRate(2);
    p.noStroke();
  };

  p.draw = () => {
    console.log(`frame ${p.frameCount} of ${LOOP_FRAME_COUNT}`);

    t = (p.frameCount % LOOP_FRAME_COUNT) / LOOP_FRAME_COUNT;

    p.shader(sh);
    sh.setUniform("uResolution", [p.width, p.height]);
    sh.setUniform("uTime", t);

    p.scale(1, -1);

    p.plane(p.width, p.height);

    // if (p.frameCount <= LOOP_FRAME_COUNT) {
    //   const frameNum = `${p.frameCount}`.padStart(4, "0");
    //   p.save(`${frameNum}.png`);
    // } else {
    //   p.noLoop();
    // }
  };
}

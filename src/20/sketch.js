export default function sketch(p, seed) {
  const NUM_POINTS = 30;
  const SIZE = 800;
  const PERIOD = 30;

  let squiggle;
  let lastU = 0;

  let scene;
  let blurH, blurV, bloomShader, brightShader;
  let brightPass, pass1, pass2, bloomPass;

  const LOOP_SECONDS = 30;
  const FRAME_RATE = 60;
  const LOOP_FRAMES = LOOP_SECONDS * FRAME_RATE;

  const NUM_SQUIGGLES = LOOP_SECONDS * 2;
  let squiggles = [];
  let currSquiggleIdx = 0;

  let recording = false;
  let loading = true;

  function load() {
    // this callback chaining is a bit nasty, but I am doing it this to not
    // over-complicate things we are only loading three shaders
    brightShader = p.loadShader(
      "../shaders/quad.vert.glsl",
      "../shaders/bright.frag.glsl",
      () => {
        blurH = p.loadShader(
          "../shaders/quad.vert.glsl",
          "../shaders/blur.frag.glsl",
          () => {
            blurV = p.loadShader(
              "../shaders/quad.vert.glsl",
              "../shaders/blur.frag.glsl",
              () => {
                bloomShader = p.loadShader(
                  "../shaders/quad.vert.glsl",
                  "../shaders/bloom.frag.glsl",
                  () => {
                    loading = false;
                  },
                );
              },
            );
          },
        );
      },
    );
  }
  p.setup = () => {
    load();

    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.createCanvas(1080, 1920, p.WEBGL);
    p.curveDetail(200);

    if (recording) {
      p.frameRate(10);
    }

    for (let i = 0; i < NUM_SQUIGGLES; i++) {
      squiggles.push(new Squiggle());
    }

    squiggle = squiggles[0];

    scene = p.createGraphics(p.width, p.height, p.WEBGL);

    brightPass = p.createFramebuffer({ width: p.width, height: p.height });
    pass1 = p.createFramebuffer({ width: p.width, height: p.height });
    pass2 = p.createFramebuffer({ width: p.width, height: p.height });
    bloomPass = p.createFramebuffer({ width: p.width, height: p.height });
  };

  p.draw = () => {
    if (loading) {
      p.clear();
      return;
    }

    const t = (p.frameCount % LOOP_FRAMES) / LOOP_FRAMES;

    const u = (t * NUM_SQUIGGLES) % 1;
    if (lastU > u) {
      currSquiggleIdx = (currSquiggleIdx + 1) % NUM_SQUIGGLES;
      squiggle = squiggles[currSquiggleIdx];
    }
    lastU = u;

    scene.background(0);
    scene.resetMatrix();
    scene.rotateY(p.lerp(0, p.TAU, t));
    squiggle.show();

    const setupQuad = () => {
      p.resetMatrix();
      p.ortho(-p.width / 2, p.width / 2, p.height / 2, -p.height / 2, 0, 10000);
    };

    p.noStroke();

    brightPass.begin();
    p.clear();
    p.shader(brightShader);
    brightShader.setUniform("tex0", scene);
    brightShader.setUniform("threshold", 0.3);
    setupQuad();
    p.plane(p.width, p.height);
    brightPass.end();

    pass1.begin();
    p.clear();
    p.shader(blurH);
    blurH.setUniform("tex0", brightPass);
    blurH.setUniform("texelSize", [1.0 / p.width, 1.0 / p.height]);
    blurH.setUniform("direction", [1.0, 0.0]);
    setupQuad();
    p.plane(p.width, p.height);
    pass1.end();

    pass2.begin();
    p.clear();
    p.shader(blurV);
    blurV.setUniform("tex0", pass1);
    blurV.setUniform("texelSize", [1.0 / p.width, 1.0 / p.height]);
    blurV.setUniform("direction", [0.0, 1.0]);
    setupQuad();
    p.plane(p.width, p.height);
    pass2.end();

    bloomPass.begin();
    p.clear();
    p.shader(bloomShader);
    bloomShader.setUniform("tex0", scene);
    bloomShader.setUniform("tex1", pass2);
    bloomShader.setUniform("intensity", 7.0);
    setupQuad();
    p.plane(p.width, p.height);
    bloomPass.end();

    p.resetShader();
    setupQuad();
    p.image(bloomPass, -p.width / 2, -p.height / 2, p.width, p.height);

    // if (p.frameCount <= LOOP_FRAMES) {
    //   const frameNum = `${p.frameCount}`.padStart(4, "0");
    //   p.save(`${frameNum}.png`);
    // } else {
    //   p.noLoop();
    // }
  };

  class Squiggle {
    constructor() {
      this.color = p.random([
        "#b96ac9",
        "#726fc9",
        "#6fc9c9",
        "#c9be6f",
        "#976fc9",
        "#c96f6f",
        "#ffffff",
      ]);

      let points = [];

      const p0 = {
        x: p.random(-SIZE / 2, SIZE / 2),
        y: p.random(-SIZE / 2, SIZE / 2),
        z: p.random(-SIZE / 2, SIZE / 2),
      };

      points.push(p0);

      for (let i = 1; i < NUM_POINTS; i++) {
        const x = p.random(-SIZE / 2, SIZE / 2);
        const y = p.random(-SIZE / 2, SIZE / 2);
        const z = p.random(-SIZE / 2, SIZE / 2);

        points.push({ x, y, z });
      }

      const centerX = points.reduce((sum, pt) => sum + pt.x, 0) / points.length;
      const centerY = points.reduce((sum, pt) => sum + pt.y, 0) / points.length;
      const centerZ = points.reduce((sum, pt) => sum + pt.z, 0) / points.length;

      this.points = points.map((pt) => {
        return { x: pt.x - centerX, y: pt.y - centerY, z: pt.z - centerZ };
      });
    }

    show() {
      const points = this.points;

      scene.stroke(this.color);
      scene.strokeWeight(16);
      scene.noFill();

      scene.beginShape();
      scene.vertex(points[0].x, points[0].y, points[0].z);

      for (let i = 1; i + 2 < points.length - 1; i += 3) {
        const c1 = points[i];
        const c2 = points[i + 1];
        const a = points[i + 2];

        scene.bezierVertex(c1.x, c1.y, c1.z, c2.x, c2.y, c2.z, a.x, a.y, a.z);
      }

      const close_i = points.length - 2;
      const close_c1 = points[close_i];
      const close_c2 = points[close_i + 1];

      scene.bezierVertex(
        close_c1.x,
        close_c1.y,
        close_c1.z,
        close_c2.x,
        close_c2.y,
        close_c2.z,
        points[0].x,
        points[0].y,
        points[0].z,
      );

      scene.endShape(p.CLOSE);
    }
  }
}

export default function day08(p) {
  const LOOP_TIME = 30;
  const FRAME_RATE = 60;
  const LOOP_FRAMES = LOOP_TIME * FRAME_RATE;

  const NUM_COLS = 50;
  const NUM_ROWS = 30;

  let buildings = [];
  let t;
  let colorA;
  let colorB;
  let fogShader;

  const bb = {
    w: 2500,
    h: 300,
    d: 800,
  };

  class Building {
    constructor(pos, upDir, rowIdx) {
      this.pos = pos.copy();
      this.setSize();
      this.upDir = upDir;
      this.rowIdx = rowIdx;
    }

    setSize() {
      const w = p.random(10, 30);
      const x = p.randomGaussian(w, 5);
      const z = p.randomGaussian(w, 5);

      let h = 20 + p.random(30);
      if (p.random() > 0.9) {
        h = 60;
      }
      this.dims = new p5.Vector(x, h, z);
    }

    update() {
      const rowT = (t + this.rowIdx / NUM_ROWS) % 1;
      this.pos.z = p.lerp(-bb.d, 0, (8 * rowT) % 1);
    }

    show() {
      p.push();
      p.translate(
        p5.Vector.sub(this.pos, p5.Vector.mult(this.upDir, this.dims.y / 2))
      );
      p.box(this.dims.x, this.dims.y, this.dims.z);
      p.pop();
    }
  }

  p.preload = () => {
    fogShader = p.loadShader(
      "./src/shaders/fog.vert.glsl",
      "./src/shaders/fog.frag.glsl"
    );
  };

  p.setup = () => {
    p.createCanvas(1080, 1920, p.WEBGL);
    // p.frameRate(10);
    p.camera(0, 0, 50);

    for (let i = 0; i < NUM_ROWS; i++) {
      const z = p.map(i, 0, NUM_ROWS - 1, -bb.d, 0);

      for (let j = 0; j < NUM_COLS; j++) {
        const x =
          -bb.w / 2 + (bb.w / (NUM_COLS - 1)) * j + p.randomGaussian(0, 10);
        const pos1 = new p5.Vector(x, bb.h / 2, z);
        const pos2 = new p5.Vector(x, -bb.h / 2, z);

        buildings.push(new Building(pos1, new p5.Vector(0, 1, 0), i));
        buildings.push(new Building(pos2, new p5.Vector(0, -1, 0), i));
      }
    }

    colorA = [-0.15589992458572938, 0.32381258814119, 0.42496778340247227];
    colorB = [0.7072683051204559, 0.4038495170413184, 0.39167631207734993];
  };

  p.draw = () => {
    t = (p.frameCount % LOOP_FRAMES) / LOOP_FRAMES;

    p.noStroke();
    p.shader(fogShader);
    fogShader.setUniform("uFogColor", colorA);
    fogShader.setUniform("uFogDensity", 0.001);
    fogShader.setUniform("uObjectColor", colorB);

    p.background(0);

    p.rotate(p.lerp(p.TWO_PI, 0, t));

    p.push();
    p.translate(0, bb.h / 2, -bb.d / 2);
    p.rotate(p.HALF_PI, [1, 0, 0]);
    p.plane(bb.w, bb.d);
    p.translate(0, 0, bb.h);
    p.plane(bb.w, bb.d);
    p.pop();

    p.push();
    p.translate(0, 0, -bb.d);
    p.plane(bb.w, bb.h);
    p.pop();

    for (const b of buildings) {
      b.update();
      b.show();
    }

    // if (p.frameCount <= LOOP_FRAMES) {
    //   let filename = p.nf(p.frameCount, 4) + ".png";
    //   p.save(filename);
    // } else {
    //   p.noLoop();
    // }
  };
}

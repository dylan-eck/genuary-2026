export default function day14(p) {
  const CAMERA_DISTANCE = 800;
  const MIN_ACCEL = 0.00002;
  const MAX_ACCEL = 0.001;
  const CYCLE_FRAME_COUNT = 150;
  const RECORD_CYCLE_COUNT = 12;
  let t;
  let box;
  let palette;
  let lightDirection;

  class Cell {
    constructor(pos, size, color, reverse = false) {
      this.origin = pos;
      this.currPos = pos;
      this.size = size;

      this.color = color;

      this.speed = p.map(pos.mag(), 0, 150, 0.1, 1);

      let dir = p5.Vector.normalize(this.origin);
      const ax = Math.abs(dir.x);
      const ay = Math.abs(dir.y);
      const az = Math.abs(dir.z);

      if (ax > ay && ax > az) {
        this.slideDir = p.createVector(nonZeroSign(pos.x), 0, 0);
      } else if (ay > ax && ay > az) {
        this.slideDir = p.createVector(0, nonZeroSign(pos.y), 0);
      } else {
        this.slideDir = p.createVector(0, 0, nonZeroSign(pos.z));
      }

      this.targetDist = 1300;
      this.target = this.origin
        .copy()
        .add(p5.Vector.mult(this.slideDir, this.targetDist));

      this.u = 0;
      this.uVel = 0.0005;

      this.reverse = reverse;
    }

    reset(reverse = this.reverse) {
      this.reverse = reverse;

      this.u = 0;
      this.uVel = 0;

      if (this.reverse) {
        this.currPos = this.target.copy();
      } else {
        this.currPos = this.origin.copy();
      }
    }

    update() {
      let d = this.currPos.mag();

      let accel;
      if (this.reverse) {
        accel = p.map(
          d,
          0.5 * this.targetDist,
          0,
          0.5 * MAX_ACCEL,
          0.7 * MAX_ACCEL
        );
      } else {
        accel = p.map(d, 0, 0.5 * this.targetDist, MIN_ACCEL, MAX_ACCEL);
      }
      accel = p.constrain(accel, MIN_ACCEL, MAX_ACCEL);

      this.uVel += accel;
      this.u += this.uVel;

      this.u = Math.min(this.u, 1);
      if (this.reverse) {
        this.currPos = p5.Vector.lerp(this.target, this.origin, this.u);
      } else {
        this.currPos = p5.Vector.lerp(this.origin, this.target, this.u);
      }
    }

    show() {
      p.push();
      p.translate(this.currPos);
      p.noStroke();
      p.fill(this.color);
      p.box(this.size.x, this.size.y, this.size.z);
      p.pop();
    }

    div(s, splitPlane) {
      let dim, dir;
      if (splitPlane === "yz") {
        dim = this.size.x;
        dir = this.origin.x;
      } else if (splitPlane === "xz") {
        dim = this.size.y;
        dir = this.origin.y;
      } else if (splitPlane === "xy") {
        dim = this.size.z;
        dir = this.origin.z;
      }

      const h1 = dim / 2 - (s * dim) / 2;
      const c1 = dir + (s * dim) / 2 + h1 / 2;

      const h2 = dim / 2 + (s * dim) / 2;
      const c2 = dir - dim / 2 + (dim / 2 + (s * dim) / 2) / 2;

      let p1 = this.origin.copy();
      let p2 = this.origin.copy();
      let s1 = this.size.copy();
      let s2 = this.size.copy();
      if (splitPlane === "yz") {
        p1.x = c1;
        p2.x = c2;

        s1.x = h1;
        s2.x = h2;
      } else if (splitPlane === "xz") {
        p1.y = c1;
        p2.y = c2;

        s1.y = h1;
        s2.y = h2;
      } else if (splitPlane === "xy") {
        p1.z = c1;
        p2.z = c2;

        s1.z = h1;
        s2.z = h2;
      }

      const t = new Cell(p1, s1, this.color, this.reverse);
      const b = new Cell(p2, s2, this.color, this.reverse);

      return { t, b };
    }
  }

  class Box {
    constructor() {
      this.prevT = 0;
      this.reverse = false;

      this.cells = [];
      this.generate();
    }

    generate() {
      this.cells = [];

      const c = new Cell(
        p.createVector(0, 0, 0),
        p.createVector(400, 400, 400),
        p.random(palette),
        this.reverse
      );
      this.cells.push(c);

      for (let i = 0; i < 4; i++) {
        let newCells = [];
        for (const cell of this.cells) {
          const { t, b } = cell.div(
            (p.random(2) - 1) * 0.6,
            p.random(["yz", "xz", "xy"])
          );
          newCells.push(t, b);
        }
        this.cells = [...newCells];
      }
    }

    update(t) {
      if (t < this.prevT) {
        if (!this.reverse) {
          this.reverse = true;
          this.generate();
        } else {
          this.cells.forEach((c) => c.reset(false));
          this.reverse = false;
        }
      }
      this.prevT = t;

      this.cells.forEach((c) => c.update(t));
    }

    show() {
      this.cells.forEach((c) => c.show());
    }
  }

  p.setup = () => {
    p.createCanvas(1080, 1920, p.WEBGL);
    p.camera(
      CAMERA_DISTANCE / p.sqrt(2),
      -CAMERA_DISTANCE * p.tan(p.PI / 6),
      CAMERA_DISTANCE / p.sqrt(2)
    );
    p.frameRate(10);

    lightDirection = p.createVector(-0.4, 1, -0.4).normalize();

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

    const gradient = culori.interpolate([colorA, colorB], "oklch");
    palette = culori.samples(10).map(gradient).map(culori.formatHex);

    box = new Box();
  };

  p.draw = () => {
    t = (p.frameCount % CYCLE_FRAME_COUNT) / (CYCLE_FRAME_COUNT - 1);

    p.ortho();
    p.directionalLight(255, 255, 255, lightDirection);
    p.ambientLight(100);
    p.background(0);

    box.update(t);
    box.show();

    // if (
    //   p.frameCount <=
    //   RECORD_CYCLE_COUNT * CYCLE_FRAME_COUNT + CYCLE_FRAME_COUNT / 2 + 60
    // ) {
    //   const frameNum = `${p.frameCount}`.padStart(4, "0");
    //   p.save(`${frameNum}.png`);
    // } else {
    //   p.noLoop();
    // }
  };

  function nonZeroSign(v) {
    return v === 0 ? (p.random() < 0.5 ? -1 : 1) : Math.sign(v);
  }
}

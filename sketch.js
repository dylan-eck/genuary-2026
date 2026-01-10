const day01 = function (p) {
  const margins = { l: 50, r: 50, t: 50, b: 50 };

  p.setup = () => {
    p.createCanvas(800, 1000);
    p.background(255);

    let radius = 16;
    let step = radius / 2;
    let cols = (p.width - margins.l - margins.r - 2 * radius) / (2 * radius);
    let rand = p.floor(p.random(cols - 1));

    for (let i = 0; i < cols; i++) {
      const y = p.height - margins.b - p.random(200);
      const maxLength = y - margins.t;
      const maxSteps = p.floor(maxLength / step);

      let n = p.floor(p.random(10, maxSteps));
      const x = p.map(
        i,
        0,
        cols - 1,
        margins.l + radius,
        p.width - margins.r - radius
      );
      trail(
        x,
        p.height - margins.b - p.random(100),
        radius,
        n,
        step,
        rand == i
      );
    }
  };

  p.keyPressed = () => {
    if (p.key === "s" || p.key === "S") {
      p.saveCanvas("out", "png");
    }
  };

  function trail(x, y, radius, count, step, color = false) {
    for (let i = 0; i < count; i++) {
      let alpha = p.map(i, 0, count - 1, 10, 255);

      if (color && i == count - 1) {
        p.noStroke();
        p.fill("red");
      } else {
        p.stroke(0, 0, 0, alpha);
        p.strokeWeight(1);
        p.fill(255, 255, 255, alpha);
      }

      tri(x, y - i * step, radius);
      alpha += 50;
    }
  }

  function tri(x, y, radius) {
    p.beginShape();
    for (let i = 0; i < 3; i++) {
      const theta = (p.TWO_PI / 3) * i - p.PI / 2;
      p.vertex(x + radius * p.cos(theta), y + radius * p.sin(theta));
    }
    p.endShape(p.CLOSE);
  }
};

const day02 = (p) => {
  const MARGIN = 50;
  const NUM_BALLS = 22;

  const FPS = 60;
  const LOOP_FRAMES = 360;

  let balls = [];
  let recorder;
  let chunks = [];
  let frame = 0;
  let started = false;

  function ball() {
    return {
      r: 45,
      a: 45,
      b: 45,
      x: 0,
      y: 0,

      update(u) {
        this.x = p.lerp(
          MARGIN + 2 * this.r,
          p.width - MARGIN - 2 * this.r,
          motion(u)
        );

        const v = velocity(u);
        const squash = p.constrain(p.pow(v * 0.08, 1.2), 0, 1);

        this.a = p.lerp(0.9 * this.r, 4 * this.r, squash);
        this.b = (this.r * this.r) / this.a;
      },

      show(u) {
        p.push();
        p.noStroke();
        p.fill(255 * easeInOutExpo(triangleWave(u)));
        p.ellipse(this.x, this.y, 2 * this.a, 2 * this.b);
        p.pop();
      },
    };
  }

  p.setup = () => {
    p.createCanvas(900, 1600);
    p.colorMode(p.HSB);
    p.frameRate(FPS);

    for (let i = 0; i < NUM_BALLS; i++) {
      const b = ball();
      b.y = p.map(
        i,
        0,
        NUM_BALLS - 1,
        MARGIN + 100,
        p.height - 2 * MARGIN - 50
      );
      balls.push(b);
    }

    const stream = p.canvas.captureStream(60);

    recorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
      videoBitsPerSecond: 8_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "day02.webm";
      a.click();

      URL.revokeObjectURL(url);
    };
  };

  p.draw = () => {
    const t = (p.frameCount % LOOP_FRAMES) / LOOP_FRAMES;

    bg();

    for (let i = 0; i < NUM_BALLS; i++) {
      let u = i % 2 === 0 ? t : (t + 0.5) % 1;
      u = (u - 0.01 * i + 1) % 1;

      balls[i].update(u);
      balls[i].show(u);
    }

    // if (!started) {
    //   recorder.start();
    //   started = true;
    // }

    // frame++;

    // if (frame > LOOP_FRAMES) {
    //   recorder.stop();
    //   p.noLoop();
    // }
  };

  function bg() {
    p.background(255);
    let ctx = p.drawingContext;
    let gradient = ctx.createLinearGradient(MARGIN, 0, p.width - MARGIN, 0);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(1, "black");
    ctx.fillStyle = gradient;
    ctx.fillRect(MARGIN, MARGIN, p.width - 2 * MARGIN, p.height - 2 * MARGIN);
  }

  function triangleWave(t, period = 1) {
    return (
      (2 / period) *
      Math.abs(((((t - period / 2) % period) + period) % period) - period / 2)
    );
  }

  function easeInOutExpo(x) {
    return x <= 0
      ? 0
      : x >= 1
      ? 1
      : x < 0.5
      ? Math.pow(2, 20 * x - 10) / 2
      : (2 - Math.pow(2, -20 * x + 10)) / 2;
  }

  function motion(u) {
    return easeInOutExpo(triangleWave(u));
  }

  function velocity(u) {
    const eps = 0.0005;
    const u1 = (u - eps + 1) % 1;
    const u2 = (u + eps) % 1;
    return Math.abs(motion(u2) - motion(u1)) / (2 * eps);
  }
};

const day03 = (p) => {
  const MARGIN = 20;

  let cells;
  let h;
  let scaleFactor = 1;

  p.setup = () => {
    const ret = fibonacciSubDiv(0, 0, p.floor(p.random(4, 12)));
    cells = ret.cells;
    w = ret.w;
    h = ret.h;

    const canvasWidth = 1000;
    scaleFactor = canvasWidth / w;

    p.createCanvas(scaleFactor * w + 2 * MARGIN, scaleFactor * h + 2 * MARGIN);
    p.noLoop();
  };

  p.draw = () => {
    p.background("#f6eee3");

    p.translate(MARGIN, MARGIN);

    for (const cell of cells) {
      console.log(cell);

      cell.setScale(scaleFactor);
      if (p.random() > 0.2) {
        p.stroke(0, 0, 0, 50);
        p.noFill();
        cell.show();
      }

      p.noStroke();
      p.fill(0);
      p.fill(p.random(["#afbd22", "#6db33f", "#00958f", "#00b193", "#a0d5b5"]));

      if (p.random() > 0.9) {
        p.stroke(0, 0, 0, 50);
        p.noFill();
      }

      let flip = p.random() > 0.5;
      leaf(cell.x, cell.y, cell.w, cell.h, 16, scaleFactor, flip);
    }
  };

  p.keyPressed = () => {
    if (p.key === "s" || p.key === "S") {
      p.saveCanvas("out", "png");
    }
  };

  class Cell {
    constructor(x, y, w, h, s) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.s = 1;
    }

    show() {
      p.rect(
        this.x * this.s,
        this.y * this.s,
        this.w * this.s,
        this.h * this.s
      );
    }

    setScale(s) {
      this.s = s;
    }

    splitHL(s) {
      return {
        l: new Cell(this.x, this.y, s, this.h),
        r: new Cell(this.x + s, this.y, this.w - s, this.h),
      };
    }

    splitHR(s) {
      return {
        l: new Cell(this.x, this.y, this.w - s, this.h),
        r: new Cell(this.x + this.w - s, this.y, s, this.h),
      };
    }

    splitVT(s) {
      return {
        t: new Cell(this.x, this.y, this.w, s),
        b: new Cell(this.x, this.y + s, this.w, this.h - s),
      };
    }

    splitVB(s) {
      return {
        t: new Cell(this.x, this.y, this.w, this.h - s),
        b: new Cell(this.x, this.y + this.h - s, this.w, s),
      };
    }
  }

  function fibonacciSubDiv(x, y, n) {
    let seq = Array(n).fill(0);
    seq[1] = 1;

    for (let i = 2; i <= n; i++) {
      seq[i] = seq[i - 1] + seq[i - 2];
    }

    const w = seq[n];
    const h = seq[n - 1];

    let cells = [];
    let currCell = new Cell(x, y, seq[n], seq[n - 1]);

    let count = 0;
    for (let i = n - 1; i > 1; i--) {
      let dir = count % 4;
      count++;
      if (dir === 0) {
        let { l, r } = currCell.splitHR(seq[i]);
        cells.push(l, r);
        currCell = l;
      } else if (dir === 1) {
        let { t, b } = currCell.splitVT(seq[i]);
        cells.push(t, b);
        currCell = b;
      } else if (dir == 2) {
        let { l, r } = currCell.splitHL(seq[i]);
        cells.push(l, r);
        currCell = r;
      } else {
        let { t, b } = currCell.splitVB(seq[i]);
        cells.push(t, b);
        currCell = t;
      }
    }

    cells = cells.filter((c) => c.w === c.h);

    console.log(cells.length);

    return { w, h, cells };
  }

  function leaf(x, y, w, h, n = 16, scaleFactor = 1, mirror = false) {
    let seq = Array(n).fill(0);
    seq[1] = 1;
    for (let i = 2; i < n; i++) {
      seq[i] = seq[i - 1] + seq[i - 2];
    }

    const cx = x + w / 2;
    const cy = y + h / 2;

    const edge = [];

    for (let i = 0; i < n; i++) {
      const sw = w / (n - 1);
      const sx = x + sw * i;
      const sh = (seq[i] / seq[n - 1]) * h;
      edge.push(p.createVector(sx, y + sh));
    }

    p.beginShape();

    function emit(px, py) {
      let ex = px;
      let ey = py;

      if (mirror) {
        ex = cx - (ex - cx);
      }

      p.vertex(ex * scaleFactor, ey * scaleFactor);
    }

    for (const p of edge) {
      emit(p.x, p.y);
    }

    for (const p of edge) {
      const mx = cx - (p.x - cx);
      const my = cy - (p.y - cy);
      emit(mx, my);
    }

    p.endShape(p.CLOSE);
  }
};

const day04 = (p) => {
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
};

const day05 = (p) => {
  const MARGIN = 40;

  p.setup = () => {
    p.createCanvas(1080, 1350);
    p.noLoop();
  };

  p.draw = () => {
    p.background(255);

    p.beginClip();
    p.rect(MARGIN, MARGIN, p.width - 2 * MARGIN, p.height - 2 * MARGIN);
    p.endClip();

    p.translate(p.width / 2, p.height / 2);
    p.rotate(p.randomGaussian(0, p.PI / 8));

    funcs = [G, E, N, U, A, R, Y];
    const overallWidth = 500 * 1.5;
    const overallHeight = 80 * 1.5;
    const gapPercent = 0.2;
    const cellWidth = overallWidth / funcs.length;

    const x0 = 0;
    const y0 = 0;
    const w = cellWidth * (1 - gapPercent);
    const h = overallHeight;
    const g = cellWidth * gapPercent;

    p.noStroke();
    p.fill(0);
    funcs = [G, E, N, U, A, R, Y];
    const countX = 7;
    const countY = 21;
    for (let i = 0; i < countY; i++) {
      const spacing = 10;
      const currY = -(countY / 2) * (h + spacing) + i * (h + 2 * spacing);

      const rowOffset = p.randomGaussian(0, 50);

      for (let j = 0; j < countX; j++) {
        const currX =
          -(countX / 2) * (overallWidth + spacing) +
          j * (overallWidth + spacing) +
          i * rowOffset;

        for (let k = 0; k < funcs.length; k++) {
          funcs[k](currX + k * (w + g), currY + h, w, h);
        }
      }
    }
  };

  p.keyPressed = () => {
    if (p.key === "s" || p.key === "S") {
      p.saveCanvas("out", "png");
    }
  };

  function G(x, y, w, h) {
    p.arc(x + h / 2, y - h / 2, h, h, p.HALF_PI, -p.HALF_PI);
    p.rect(x + h / 2, y - h / 2, w - h / 2, h / 2);
  }

  function E(x, y, w, h) {
    const t = 0.25 * h;

    p.beginShape();
    p.vertex(x, y - h);
    p.vertex(x + w, y - h);
    p.vertex(x + w, y - h + t);
    p.vertex(x, y - h + t);
    p.endShape(p.CLOSE);

    p.beginShape();
    p.vertex(x, y - h / 2 - t / 2);
    p.vertex(x + w, y - h / 2 - t / 2);
    p.vertex(x + w, y - h / 2 + t / 2);
    p.vertex(x, y - h / 2 + t / 2);
    p.endShape(p.CLOSE);

    p.beginShape();
    p.vertex(x, y);
    p.vertex(x + w, y);
    p.vertex(x + w, y - t);
    p.vertex(x, y - t);
    p.endShape(p.CLOSE);
  }

  function N(x, y, w, h) {
    p.beginShape();
    p.vertex(x, y);
    p.vertex(x, y - h);
    p.vertex(x + w / 2, y - h / 2);
    p.vertex(x + w / 2, y - h);
    p.vertex(x + w, y - h);
    p.vertex(x + w, y);
    p.endShape(p.CLOSE);
  }

  function U(x, y, w, h) {
    p.rect(x, y - h, w, h - w / 2);
    p.arc(x + w / 2, y - w / 2, w, w, 0, p.PI);
  }

  function A(x, y, w, h) {
    p.triangle(x, y, x + w / 2, y - h, x + w, y);
  }

  function R(x, y, w, h) {
    p.rect(x, y - h, w / 2, h);
    p.arc(x + w / 2, y - h + w / 2, w, w, -p.HALF_PI, p.HALF_PI);
    p.triangle(x + w / 2, y, x + w / 2, y - h + w, x + w, y);
  }

  function Y(x, y, w, h) {
    p.rect(x, y - h, w / 2, h);
    p.triangle(x + w / 2, y - h, x + w / 2, y - h / 2, x + w, y - h);
  }
};

const day06 = (p) => {
  const NUM_BUGS = 50;
  const BASE_SPEED = 0.5;

  let bugs = [];
  let light;

  let t = 0;
  const DT = 0.01;

  let counter = 0;
  let offCount = 120;
  let onCount = 240;

  let recorder;
  let chunks = [];
  let frame = 0;
  let started = false;
  const FRAME_RECORD_COUNT = 360 * 8;

  p.setup = () => {
    p.createCanvas(1080, 1920);
    p.frameRate(60);

    light = new Light(p.width / 2, p.height / 2);

    for (let i = 0; i < NUM_BUGS; i++) {
      const pos = p.createVector(p.random(p.width), p.random(p.height));
      const vel = p5.Vector.random2D().setMag(BASE_SPEED);
      bugs.push(new Bug(pos, vel));
    }

    const stream = p.canvas.captureStream(60);

    recorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
      videoBitsPerSecond: 8_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "day06.webm";
      a.click();

      URL.revokeObjectURL(url);
    };
  };

  p.draw = () => {
    p.background(30);

    if (light.on && counter > onCount) {
      light.on = false;
      counter = 0;
    } else if (!light.on && counter > offCount) {
      light.on = true;
      counter = 0;
    }

    counter++;

    light.update();
    light.show();

    for (const bug of bugs) {
      bug.update();
      bug.show();
    }

    t += DT;

    if (!started) {
      recorder.start();
      started = true;
    }

    frame++;

    if (frame > FRAME_RECORD_COUNT) {
      recorder.stop();
      p.noLoop();
    }
  };

  class Bug {
    constructor(pos, vel) {
      this.pos = pos;
      this.vel = vel;

      this.setTarget();
      this.targetIsLight = false;

      this.seedX = p.random(10000);
      this.seedY = p.random(10000);
    }

    update() {
      if (light.on) {
        const distToLight = p
          .createVector(light.x, light.y)
          .sub(this.pos)
          .mag();

        if (distToLight < light.d / 2) {
          this.pos = new p5.Vector(p.random(p.width), p.random(p.height));
        } else {
          this.target.x = light.x;
          this.target.y = light.y;
          this.targetIsLight = true;
        }
      } else {
        const targetDist = this.target.copy().sub(this.pos).mag();

        if (this.targetIsLight || targetDist < 20) {
          this.setTarget();
          this.targetIsLight = false;
        }
      }

      const accel = this.target.copy().sub(this.pos).setMag(0.08);
      const steering = p.map(
        p.noise(this.seedX, this.seedY, t),
        0,
        1,
        -0.1 * p.PI,
        0.1 * p.PI
      );

      this.vel.add(accel);
      this.vel.setMag(0.5);
      this.vel.rotate(steering);

      this.pos.add(this.vel);
      this.wrap(this.pos);
    }

    show() {
      p.push();

      if (light.on) {
        const dirToLight = p
          .createVector(light.x, light.y)
          .sub(this.pos)
          .setMag(p.width + p.height);

        p.stroke(0, 0, 0, 80);
        p.strokeWeight(8);
        p.line(
          this.pos.x,
          this.pos.y,
          this.pos.x - dirToLight.x,
          this.pos.y - dirToLight.y
        );
      }

      p.stroke(0);
      p.strokeWeight(8);
      p.noFill();
      p.point(this.pos.x, this.pos.y);

      p.pop();
    }

    wrap(vec) {
      if (vec.x < 0) vec.x += p.width;
      else if (vec.x > p.width) vec.x -= p.width;

      if (vec.y < 0) vec.y += p.height;
      else if (vec.y > p.height) vec.y -= p.height;
    }

    setTarget() {
      const facing = this.vel.heading();
      const targetDir = p.randomGaussian(facing, p.TWO_PI);
      const targetDist = p.randomGaussian(p.width, 0.5 * p.width);

      this.target = this.pos
        .copy()
        .add(p5.Vector.fromAngle(targetDir, targetDist));

      this.wrap(this.target);
    }
  }

  class Light {
    constructor(x, y, d = 40, on = false) {
      this.x = x;
      this.y = y;
      this.d = d;
      this.on = on;

      this.intensity = on ? 1 : 0; // 0..1
      this.fadeSpeed = 0.1; // adjust for faster/slower fade
    }

    update() {
      const target = this.on ? 1 : 0;
      this.intensity = p.lerp(this.intensity, target, this.fadeSpeed);
    }

    show() {
      if (this.intensity > 0.001) {
        const ctx = p.drawingContext;

        const cx = p.width / 2;
        const cy = p.height / 2;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, p.width);

        grad.addColorStop(0, `rgba(255, 255, 200, ${0.8 * this.intensity})`);
        grad.addColorStop(1, "rgba(255, 255, 200, 0)");

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, p.width, p.height);
      }

      p.push();
      p.noStroke();
      p.fill(
        this.on ? p.color(255, 255, 220, 255 * this.intensity) : p.color(50)
      );
      p.circle(this.x, this.y, this.d);
      p.pop();
    }
  }
};

const day07 = (p) => {
  let raymarchShader;

  let colorA;
  let colorB;

  const NUM_BOXES = 10;
  let boxes = [];

  const LOOP_TIME = 6.0;

  let recorder;
  let chunks = [];
  let frame = 0;
  let started = false;
  const FRAME_RECORD_COUNT = 60 * 6;

  p.preload = function () {
    raymarchShader = p.loadShader("raymarch.vert", "raymarch.frag");
  };

  p.setup = function () {
    p.createCanvas(1080, 1920, p.WEBGL);
    p.blendMode(p.BLEND);
    p.frameRate(60);

    colorA = {
      mode: "oklch",
      l: 0.4,
      c: 0.1,
      h: p.random(360),
    };

    const hueShift = 180;
    colorB = {
      ...colorA,
      l: colorA.l + 0.2,
      h: (((colorA.h + hueShift) % 360) + 360) % 360,
    };

    p.shader(raymarchShader);

    for (let i = 0; i < NUM_BOXES; i++) {
      const r = p.random() * 0.6;
      const theta = p.random(p.TWO_PI);
      const w = p.random(0.1, 0.3);
      const h = p.random(0.5, 1.5);

      const box = {
        pos: [r * p.cos(theta), 0, r * p.sin(theta)],
        size: [w, h, w],
        phase: p.random(p.TWO_PI),
      };

      boxes.push(box);
    }

    const stream = p.canvas.captureStream(60);

    recorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
      videoBitsPerSecond: 8_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "day07.webm";
      a.click();

      URL.revokeObjectURL(url);
    };
  };

  p.draw = function () {
    let t = (frame / FRAME_RECORD_COUNT) * LOOP_TIME;
    let loopPhase = (p.TWO_PI * t) / LOOP_TIME;

    for (const box of boxes) {
      box.pos[1] = 0.5 * p.sin(loopPhase + box.phase);
      box.size[1] = Math.abs(p.sin(loopPhase + box.phase)) + 0.2;
    }

    raymarchShader.setUniform("uResolution", [p.width, p.height]);
    raymarchShader.setUniform(
      "uBoxPositions",
      boxes.flatMap((b) => b.pos)
    );
    raymarchShader.setUniform(
      "uBoxSizes",
      boxes.flatMap((b) => b.size)
    );
    raymarchShader.setUniform("uColorA", [colorA.l, colorA.c, colorA.h]);
    raymarchShader.setUniform("uColorB", [colorB.l, colorB.c, colorB.h]);

    drawBackgroundGradient(
      p.color(culori.formatHex(colorA)),
      p.color(culori.formatHex(colorB))
    );

    p.noStroke();
    p.plane(p.width, p.height);

    if (!started) {
      recorder.start();
      started = true;
    }

    frame++;

    if (frame > FRAME_RECORD_COUNT) {
      recorder.stop();
      p.noLoop();
    }
  };

  function drawBackgroundGradient(topColor, bottomColor) {
    for (let y = -p.height / 2; y < p.height; y++) {
      let inter = p.map(y, 0, p.height, 0, 1);
      let c = p.lerpColor(topColor, bottomColor, inter);
      p.stroke(c);
      p.line(-p.width / 2, y, p.width, y);
    }
  }
};

const day08 = (p) => {
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
    fogShader = p.loadShader("fog.vert", "fog.frag");
  };

  p.setup = () => {
    p.createCanvas(1080, 1920, p.WEBGL);
    p.frameRate(10);
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

    if (p.frameCount <= LOOP_FRAMES) {
      let filename = p.nf(p.frameCount, 4) + ".png";
      p.save(filename);
    } else {
      p.noLoop();
    }
  };
};

const day09 = (p) => {
  const CANVAS_WIDTH = 1080 / 2;
  const CANVAS_HEIGHT = 1920 / 2;
  const SCALE = 1 / 16;
  const DOMAIN_WIDTH = CANVAS_WIDTH * SCALE;
  const DOMAIN_HEIGHT = CANVAS_HEIGHT * SCALE;

  const RECORD_FRAME_COUNT = 60 * 15;

  let caShader, dispShader;
  let currFrame, prevFrame, dispFrame;
  let palette = [];

  p.preload = () => {
    caShader = p.loadShader("quad.vert", "ca.frag");
    dispShader = p.loadShader("quad.vert", "disp.frag");
  };

  p.setup = () => {
    p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, p.WEBGL);
    p.frameRate(5);

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
};

// const day01Canvas = new p5(day01);
// const day02Canvas = new p5(day02);
// const day03Canvas = new p5(day03);
// const day04Canvas = new p5(day04);
// const day05Canvas = new p5(day05);
// const day06Canvas = new p5(day06);
// const day07Canvas = new p5(day07);
// const day08Canvas = new p5(day08);
const day09Canvas = new p5(day09);

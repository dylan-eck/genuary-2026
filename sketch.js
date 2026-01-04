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

// const day01Canvas = new p5(day01);
// const day02Canvas = new p5(day02);
const day03Canvas = new p5(day03);

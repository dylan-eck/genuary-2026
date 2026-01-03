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
    if (key === "s" || key === "S") {
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

const day01Canvas = new p5(day01);
const day02Canvas = new p5(day02);

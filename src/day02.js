export default function day02(p) {
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
}

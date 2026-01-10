export default function day06(p) {
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
}

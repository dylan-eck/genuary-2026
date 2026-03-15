export default function sketch(p, seed) {
  const RECORD_FRAME_COUNT = 60 * 90;

  const g = 1;
  const m1 = 2;
  const m2 = 2;
  const L1 = 200;
  const L2 = 300;

  let t1 = 3;
  let t2 = 2;
  let v1 = 0;
  let v2 = 0;

  let a, b, c, d, e;

  const dt = 0.2;

  let origin;
  let gradient;
  let recording = false;

  p.setup = () => {
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.frameRate(recording ? 10 : 60);
    p.createCanvas(1080, 1920);
    p.background(0);

    origin = {
      x: p.width / 2,
      y: 0.4 * p.height,
    };

    gradient = culori.interpolate(["#157B7D", "#FDBB2D"], "oklch");
  };

  p.draw = () => {
    a = -g * (2 * m1 + m2) * p.sin(t1);
    b = -m2 * g * p.sin(t1 - 2 * t2);
    c = v2 * v2 * L2 + v1 * v1 * L1 * p.cos(t1 - t2);
    d = -2 * p.sin(t1 - t2) * m2;
    e = L1 * (2 * m1 + m2 - m2 * p.cos(2 * t1 - 2 * t2));

    const a1 = (a + b + c * d) / e;

    a = 2 * p.sin(t1 - t2);
    b = v1 * v1 * L1 * (m1 + m2);
    c = g * (m1 + m2) * p.cos(t1);
    d = v2 * v2 * L2 * m2 * p.cos(t1 - t2);
    e = L2 * (2 * m1 + m2 - m2 * p.cos(2 * t1 - 2 * t2));

    const a2 = (a * (b + c + d)) / e;

    v1 += a1 * dt;
    v2 += a2 * dt;

    t1 += v1;
    t2 += v2;

    const p1 = {
      x: origin.x + L1 * p.sin(t1),
      y: origin.y + L1 * p.cos(t1),
    };

    const p2 = {
      x: p1.x + L2 * p.sin(t2),
      y: p1.y + L2 * p.cos(t2),
    };

    // p.background(0);
    p.strokeWeight(12);
    p.strokeCap(p.SQUARE);

    const alpha0 = 0.01;
    const alpha1 = 0.07;

    const n = 40;
    for (let i = 1; i < n; i++) {
      const t0 = (i - 1) / (n - 1);
      const t1 = i / (n - 1);

      const u = t1 * 0.5;
      const c1 = culori.formatHex8({
        ...gradient(u),
        alpha: p.lerp(alpha0, alpha1, u * u),
      });
      p.stroke(c1);

      const x10 = origin.x + (p1.x - origin.x) * t0;
      const y10 = origin.y + (p1.y - origin.y) * t0;

      const x11 = origin.x + (p1.x - origin.x) * t1;
      const y11 = origin.y + (p1.y - origin.y) * t1;

      p.line(x10, y10, x11, y11);

      const x20 = p1.x + (p2.x - p1.x) * t0;
      const y20 = p1.y + (p2.y - p1.y) * t0;

      const x21 = p1.x + (p2.x - p1.x) * t1;
      const y21 = p1.y + (p2.y - p1.y) * t1;

      const v = 0.5 + t1 * 0.5;
      const c2 = culori.formatHex8({
        ...gradient(v),
        alpha: p.lerp(alpha0, alpha1, v * v),
      });
      p.stroke(c2);

      p.line(x20, y20, x21, y21);
    }

    if (!recording) return;

    // if (p.frameCount <= RECORD_FRAME_COUNT) {
    //   const frameNum = `${p.frameCount}`.padStart(4, "0");
    //   p.save(`${frameNum}.png`);
    // } else {
    //   p.noLoop();
    // }
  };
}

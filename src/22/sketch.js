export default function sketch(p, seed) {
  const PAPER_W_IN = 9;
  const PAPER_H_IN = 12;
  const UNITS_PER_IN = 100;

  const SHAPE_DEV = 10;
  const POINT_DEV = 2;

  let lineSegments = [];
  let rays = [];
  let lightPos;

  p.setup = () => {
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.createCanvas(PAPER_W_IN * UNITS_PER_IN, PAPER_H_IN * UNITS_PER_IN, p.SVG);

    const svg = document.querySelector("svg");

    svg.setAttribute("width", `${PAPER_W_IN}in`);
    svg.setAttribute("height", `${PAPER_H_IN}in`);
    svg.setAttribute("viewBox", `0 0 ${p.width} ${p.height}`);

    lightPos = {
      x: p.random(p.width),
      y: p.random(p.height),
    };

    const n = 128;
    const r0 = 40;
    const r1 = p.width + p.height;
    for (let i = 0; i < n; i++) {
      const theta = p.lerp(0.0001, p.TAU - 0.0001, i / n);

      rays.push({
        ox: lightPos.x + r0 * p.cos(theta),
        oy: lightPos.y + r0 * p.sin(theta),
        dx: r1 * p.cos(theta),
        dy: r1 * p.sin(theta),
      });
    }

    for (let i = 0; i < 5; i++) {
      lineSegments.push(
        ...randomPolygon(
          p.random(p.width),
          p.random(p.height),
          p.random(3, 5),
          p.random(50, 150),
        ),
      );
    }

    p.noLoop();
  };

  p.draw = () => {
    p.clear();

    p.background(0);
    p.stroke(255);
    p.strokeWeight(1);

    lineSegments.forEach((ln) =>
      p.line(ln.ox, ln.oy, ln.ox + ln.dx, ln.oy + ln.dy),
    );

    rays.forEach((ray) => {
      const intersection = getNearestIntersection(ray, lineSegments);
      if (!intersection) {
        p.line(ray.ox, ray.oy, ray.ox + ray.dx, ray.oy + ray.dy);
      } else {
        p.line(ray.ox, ray.oy, intersection.x, intersection.y);
      }
    });
  };

  p.keyPressed = () => {
    if (p.key.toLowerCase() === "s") {
      p.save("out.svg");
    }
  };

  function raySegmentIntersection(ray, segment) {
    const T2 =
      (ray.dx * (segment.oy - ray.oy) + ray.dy * (ray.ox - segment.ox)) /
      (segment.dx * ray.dy - segment.dy * ray.dx);

    const T1 = (segment.ox + segment.dx * T2 - ray.ox) / ray.dx;

    if (T1 < 0 || T2 < 0 || T2 > 1) return -1;

    return T1;
  }

  function getNearestIntersection(ray, segments) {
    const nearestSeg = segments
      .map((seg) => {
        return { ...seg, t: raySegmentIntersection(ray, seg) };
      })
      .filter((seg) => seg.t >= 0 && seg.t <= 1)
      .sort((a, b) => a.t - b.t)[0];

    if (!nearestSeg) return undefined;

    return {
      x: ray.ox + ray.dx * nearestSeg.t,
      y: ray.oy + ray.dy * nearestSeg.t,
    };
  }

  function randomPolygon(x, y, n, r) {
    const shapeOffset = {
      x: p.randomGaussian(0, SHAPE_DEV),
      y: p.randomGaussian(0, SHAPE_DEV),
    };

    let points = [];
    for (let i = 0; i < n; i++) {
      const theta = p.lerp(0, p.TAU, i / n);

      points.push({
        x:
          x + r * p.cos(theta) + p.randomGaussian(0, POINT_DEV) + shapeOffset.x,
        y:
          y + r * p.sin(theta) + p.randomGaussian(0, POINT_DEV) + shapeOffset.y,
      });
    }

    const segments = [];
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = i === points.length - 1 ? points[0] : points[i + 1];

      segments.push({ ox: p1.x, oy: p1.y, dx: p2.x - p1.x, dy: p2.y - p1.y });
    }

    return segments;
  }
}

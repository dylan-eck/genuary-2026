export default function day19(p) {
  const MARGIN_PX = 80;
  let size;
  let bgShader;
  let bgFramebuffer;

  p.preload = () => {
    bgShader = p.loadShader(
      "./src/shaders/quad.vert.glsl",
      "./src/shaders/noise.frag.glsl",
    );
  };

  p.setup = () => {
    p.createCanvas(1080, 1350, p.WEBGL);
    p.stroke(0);
    p.strokeWeight(5);
    p.noLoop();

    bgFramebuffer = p.createFramebuffer();

    size = (0.8 * (p.width - 2 * MARGIN_PX)) / 16;
  };

  p.draw = () => {
    bgFramebuffer.begin();
    p.shader(bgShader);
    bgShader.setUniform("u_time", p.random(1000));
    bgShader.setUniform("u_resolution", [p.width, p.height]);
    p.noStroke();
    p.plane(p.width, p.height);
    bgFramebuffer.end();

    p.image(bgFramebuffer, -p.width / 2, -p.height / 2, p.width, p.height);

    p.translate(-p.width / 2, -p.height / 2);

    const n = 16;
    for (let i = 0; i < n; i++) {
      const y = MARGIN_PX + ((p.width - 2 * MARGIN_PX) / (n - 1)) * i;
      for (let j = 0; j < n; j++) {
        if (p.random() < 0.2) continue;

        const x = MARGIN_PX + ((p.width - 2 * MARGIN_PX) / (n - 1)) * j;

        const col = p.randomGaussian(30, 2);
        p.stroke(col);
        if (p.random() < 0.5) {
          p.fill(col);
        } else {
          p.noFill();
        }

        const f = p.random([
          roughCircle,
          roughTriangle,
          roughSquare,
          roughCross,
        ]);
        f(x, y, 0.5, 0.2);
      }
    }
  };

  p.keyPressed = () => {
    if (p.key.toLowerCase() === "s") {
      p.save("out.png");
    }
  };

  function jitter(points, groupDeviation, pointDeviation) {
    const groupOffset = {
      x: p.randomGaussian(0, groupDeviation),
      y: p.randomGaussian(0, groupDeviation),
    };

    return points.map((pt) => {
      return {
        x: pt.x + groupOffset.x + p.randomGaussian(0, pointDeviation),
        y: pt.y + groupOffset.y + p.randomGaussian(0, pointDeviation),
      };
    });
  }

  function roughSquare(x, y, posDeviation, pointDeviation) {
    const n = 8;
    let sides = [[], [], [], []];

    for (let i = 0; i < n; i++) {
      const d1 = p.lerp(-size / 2, size / 2, i / n);
      const d2 = p.lerp(size / 2, -size / 2, i / n);

      sides[0].push({ x: x + d1, y: y - size / 2 });
      sides[1].push({ x: x + size / 2, y: y + d1 });
      sides[2].push({ x: x + d2, y: y + size / 2 });
      sides[3].push({ x: x - size / 2, y: y + d2 });
    }

    p.beginShape();
    sides.forEach((side) => {
      jitter(side, posDeviation, pointDeviation).forEach((pt) =>
        p.vertex(pt.x, pt.y),
      );
    });
    p.endShape(p.CLOSE);
  }

  function roughCircle(x, y, posDeviation, pointDeviation) {
    const r = size / 2;
    let points = [];
    const n = 32;
    for (let i = 0; i < n; i++) {
      const theta = p.lerp(0, p.TAU, i / n);
      points.push({
        x: x + r * p.cos(theta),
        y: y + r * p.sin(theta),
      });
    }

    p.beginShape();
    jitter(points, posDeviation, pointDeviation).forEach((pt) =>
      p.vertex(pt.x, pt.y),
    );
    p.endShape(p.CLOSE);
  }

  function roughCross(x, y, posDeviation, pointDeviation) {
    const n = 10;
    const lines = [[], []];
    for (let i = 0; i < n; i++) {
      const dx = p.lerp(-size / 2, size / 2, i / (n - 1));
      const dy = p.lerp(-size / 2, size / 2, i / (n - 1));

      lines[0].push({ x: x + dx, y: y + dy });
      lines[1].push({ x: x + dx, y: y - dy });
    }

    lines.forEach((line) => {
      p.beginShape();
      jitter(line, posDeviation, pointDeviation).map((pt) =>
        p.vertex(pt.x, pt.y),
      );
      p.endShape();
    });
  }

  function roughTriangle(x, y, posDeviation, pointDeviation) {
    const orientation = p.random(["tl", "tr", "bl", "br"]);

    const n = 10;
    const sides = [[], [], []];
    for (let i = 0; i < n; i++) {
      const d1 = p.lerp(-size / 2, size / 2, i / n);
      const d2 = p.lerp(size / 2, -size / 2, i / n);

      if (orientation === "tl") {
        sides[0].push({ x: x + d1, y: y - size / 2 });
        sides[1].push({ x: x + d2, y: y + d1 });
        sides[2].push({ x: x - size / 2, y: y + d2 });
      } else if (orientation === "tr") {
        sides[0].push({ x: x + d1, y: y - size / 2 });
        sides[1].push({ x: x + size / 2, y: y + d1 });
        sides[2].push({ x: x + d2, y: y + d2 });
      } else if (orientation === "bl") {
        sides[0].push({ x: x + d1, y: y + size / 2 });
        sides[1].push({ x: x + size / 2, y: y + d2 });
        sides[2].push({ x: x + d2, y: y + d1 });
      } else if (orientation === "br") {
        sides[0].push({ x: x - size / 2, y: y + d1 });
        sides[1].push({ x: x + d1, y: y + size / 2 });
        sides[2].push({ x: x + d2, y: y + d2 });
      }
    }

    p.beginShape();
    sides.forEach((side) =>
      jitter(side, posDeviation, pointDeviation).forEach((pt) =>
        p.vertex(pt.x, pt.y),
      ),
    );
    p.endShape(p.CLOSE);
  }
}

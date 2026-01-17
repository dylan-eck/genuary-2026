export default function day16(p) {
  const MARGIN_PX = 80;
  const NUM_PATHS = 80;

  let paths = [];

  p.setup = () => {
    p.createCanvas(1080, 1350);
    p.noLoop();

    const dev = 50;
    const stepSize = 6;
    const numSteps = p.height / stepSize;
    for (let i = 0; i < NUM_PATHS; i++) {
      const path = [
        {
          x: p.map(i, 0, NUM_PATHS - 1, MARGIN_PX, p.width - MARGIN_PX),
          y: MARGIN_PX,
        },
      ];
      for (let j = 0; j < numSteps; j++) {
        const pt = path.at(-1);

        const dx = p.lerp(
          0,
          p.map(p.noise(0.05 * (pt.y + i * 200)), 0, 1, -dev / 2, dev / 2),
          easeInExpo(pt.y / p.height)
        );

        path.push({
          x: pt.x + dx,
          y: pt.y + stepSize,
        });
      }

      const pathOffsetAmt = 0.4;
      const pathXOffset = p.randomGaussian(0, pathOffsetAmt);
      const pathYOffset = p.randomGaussian(0, pathOffsetAmt);

      const pointOffsetAmt = 0.2;

      path.forEach((pt) => {
        const pointXOffset = p.randomGaussian(0, pointOffsetAmt);
        const pointYOffset = p.randomGaussian(0, pointOffsetAmt);

        pt.x += pathXOffset + pointXOffset;
        pt.y += pathYOffset + pointYOffset;
      });

      paths.push(path);
    }
  };

  p.draw = () => {
    p.background(255);
    p.stroke(0);
    p.strokeWeight(4);
    p.noFill();
    paths.forEach((path) => {
      p.beginShape();
      path.forEach((pt) => p.vertex(pt.x, pt.y));
      p.endShape();
    });
  };

  p.keyPressed = () => {
    if (p.key.toLowerCase() === "s") {
      p.save("day16.png");
    }
  };

  function easeInExpo(x) {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
  }
}

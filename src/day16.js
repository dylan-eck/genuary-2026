export default function day16(p) {
  const LOOP_SECONDS = 30;
  const FRAME_RATE = 60;
  const LOOP_FRAMES = LOOP_SECONDS * FRAME_RATE;

  const MARGIN_PX = 40;

  let res, numRows, numCols, grid;
  let osNoise;

  p.setup = () => {
    p.createCanvas(1080 / 2, 1920 / 2);
    // p.frameRate(10);

    res = 10;
    numRows = p.floor(p.height / res);
    numCols = p.floor(p.width / res);
    grid = Array(numRows * numCols).fill(0);

    osNoise = new OpenSimplexNoise(Date.now());
  };

  p.draw = () => {
    p.background(255);

    const t = (p.frameCount % LOOP_FRAMES) / (LOOP_FRAMES - 1);

    for (let i = 0; i < grid.length; i++) {
      const x = (i % numCols) * res;
      const y = p.floor(i / numCols) * res;

      const f = 0.02;
      const n =
        osNoise.noise3D(f * x, f * y, (0.1 * p.millis()) / 1000) * 0.5 + 0.5;
      const v = p.lerp(p.HALF_PI, n * p.TAU, easeInExpo(y / p.height));

      grid[i] = v;

      // p.noStroke();
      // p.fill((v / p.TAU) * 255);
      // p.rect(x, y, res, res);
    }

    p.stroke(0);
    p.strokeWeight(4);
    p.noFill();
    const numStrands = 40;
    for (let i = 0; i < numStrands; i++) {
      const stepSize = res / 4;
      const path = [
        {
          x: p.map(i, 0, numStrands - 1, MARGIN_PX, p.width - MARGIN_PX),
          y: MARGIN_PX,
        },
      ];
      for (let i = 0; i < 400; i++) {
        const pt = path.at(-1);

        const x = (pt.x - MARGIN_PX) / res;
        const y = (pt.y - MARGIN_PX) / res;

        // const idx = p.floor(x) + p.floor(y) * numCols;
        // const v = grid[idx];
        const v = sampleAngleBilinear(grid, x, y, numCols, numRows);

        path.push({
          x: pt.x + stepSize * p.cos(v),
          y: pt.y + stepSize * p.sin(v),
        });
      }

      p.beginShape();
      path.map((pt) => p.vertex(pt.x, pt.y));
      p.endShape();
    }
  };

  function easeInSine(x) {
    return 1 - Math.cos((x * Math.PI) / 2);
  }

  function easeInCubic(x) {
    return x * x * x;
  }

  function easeInExpo(x) {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
  }

  function sampleAngleBilinear(grid, x, y, numCols, numRows) {
    x = p.constrain(x, 0, numCols - 1.001);
    y = p.constrain(y, 0, numRows - 1.001);

    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = x0 + 1;
    const y1 = y0 + 1;

    const tx = x - x0;
    const ty = y - y0;

    const idx = (xx, yy) => xx + yy * numCols;

    const a00 = grid[idx(x0, y0)];
    const a10 = grid[idx(x1, y0)];
    const a01 = grid[idx(x0, y1)];
    const a11 = grid[idx(x1, y1)];

    const cx0 = p.lerp(p.cos(a00), p.cos(a10), tx);
    const sx0 = p.lerp(p.sin(a00), p.sin(a10), tx);
    const cx1 = p.lerp(p.cos(a01), p.cos(a11), tx);
    const sx1 = p.lerp(p.sin(a01), p.sin(a11), tx);

    const cx = p.lerp(cx0, cx1, ty);
    const sx = p.lerp(sx0, sx1, ty);

    return p.atan2(sx, cx);
  }
}

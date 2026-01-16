export default function day15(p) {
  const ALPHA = 10;
  let res, numRows, numCols, grid;
  let rot = 0;

  p.setup = () => {
    p.createCanvas(1080, 1920);
    p.pixelDensity(1);

    res = 4;
    numRows = p.height / res;
    numCols = p.width / res;
    grid = Array(numRows * numCols).fill(0);

    grid[0] = 255;
  };

  p.draw = () => {
    p.background(0);
    p.noStroke();

    p.push();
    p.stroke("red");
    p.strokeWeight(150);
    p.strokeCap(p.SQUARE);
    p.noFill();
    const nextGrid = Array(numRows * numCols).fill(0);
    rot += 0.0001 * p.deltaTime;
    const x = p.width / 2;
    const y = p.height / 2;
    const r = 400;
    for (let i = 0; i < 5; i++) {
      const theta = (p.map(i, 0, 5, 0, p.TAU) + rot) % p.TAU;
      p.line(x, y, x + r * p.cos(theta), y + r * p.sin(theta));
    }

    p.loadPixels();
    for (let i = 0; i < grid.length; i++) {
      const x = i % numCols;
      const y = p.floor(i / numCols);

      const xsc = x * res + res / 2;
      const ysc = y * res + res / 2;

      const pixel = p.pixels[4 * (xsc + ysc * p.width)];
      if (pixel > 0) {
        nextGrid[i] = null;
      }
    }
    p.pop();

    // SAND SIM =======
    for (let i = 0; i < 4; i++) {
      grid[p.floor(p.random(numCols))] = 255;
    }

    for (let i = 0; i < grid.length; i++) {
      const x = i % numCols;
      const y = p.floor(i / numCols);

      if (nextGrid[i] === null) {
        p.fill("red");
        p.rect(x * res, y * res, res, res);
        continue;
      }
      if (grid[i] <= ALPHA) continue;

      const belowIdx = x + (y + 1) * numCols;

      if (grid[belowIdx] === undefined) {
        nextGrid[i] = 0;
      } else {
        const possibleIndices = [
          belowIdx,
          i + 1,
          i - 1,
          belowIdx - 1,
          belowIdx + 1,
        ].filter((idx) => {
          return grid[idx] === 0 && nextGrid[idx] !== null;
        });

        if (possibleIndices.includes(belowIdx)) {
          nextGrid[belowIdx] = 255;
        } else {
          nextGrid[p.random(possibleIndices)] = 255;
        }

        const belowLeftIdx = belowIdx - 1;
        const belowRightIdx = belowIdx + 1;
      }

      p.fill(grid[i]);
      p.rect(x * res, y * res, res, res);
    }
    grid = [...nextGrid];
  };

  p.mouseDragged = () => {
    const x = p.floor(p.mouseX / res);
    const y = p.floor(p.mouseY / res);
    const idx = x + y * numCols;

    grid[idx] = 255;
  };
}

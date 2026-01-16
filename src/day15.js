export default function day15(p) {
  let res, numRows, numCols, grid;
  let rot = 0;
  let trailLayer;

  let RECORD_TIME = 60;
  let FRAME_RATE = 60;

  p.setup = () => {
    p.createCanvas(1080, 1920);
    p.pixelDensity(1);
    // p.frameRate(5);

    trailLayer = p.createGraphics(p.width, p.height);
    trailLayer.noStroke();

    res = 8;
    numRows = p.height / res;
    numCols = p.width / res;
    grid = Array(numRows * numCols).fill(0);

    grid[0] = 255;
  };

  p.draw = () => {
    p.clear();
    p.push();
    p.stroke(255);
    p.strokeWeight(180);
    p.strokeCap(p.SQUARE);
    p.noFill();

    rot += 0.0002 * (1000 / 60);
    const x = p.width / 2;
    const y = (2 * p.height) / 3;
    const r = 400;
    for (let i = 0; i < 5; i++) {
      const theta = (p.map(i, 0, 5, 0, p.TAU) + rot) % p.TAU;
      p.line(x, y, x + r * p.cos(theta), y + r * p.sin(theta));
    }
    p.pop();

    const nextGrid = Array(numRows * numCols).fill(0);

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

    trailLayer.fill(0, 20);
    trailLayer.rect(0, 0, p.width, p.height);

    for (let i = 0; i < 8; i++) {
      grid[p.floor(p.random(numCols))] = 255;
    }

    for (let i = 0; i < grid.length; i++) {
      const x = i % numCols;
      const y = p.floor(i / numCols);

      if (grid[i] === 0 || nextGrid[i] === null) continue;
      if (grid[i] === null) {
        nextGrid[i] === null;
        continue;
      }

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

        if (possibleIndices.length > 0) {
          if (possibleIndices.includes(belowIdx)) {
            nextGrid[belowIdx] = 255;
          } else {
            const target = p.random(possibleIndices);
            nextGrid[target] = 255;
          }
        }
      }

      trailLayer.fill(255);
      trailLayer.rect(x * res, y * res, res, res);
    }
    grid = [...nextGrid];

    p.background(0);
    p.image(trailLayer, 0, 0);

    // if (p.frameCount <= RECORD_TIME * FRAME_RATE) {
    //   const frameNum = `${p.frameCount}`.padStart(4, "0");
    //   p.save(`${frameNum}.png`);
    // } else {
    //   p.noLoop();
    // }
  };
}

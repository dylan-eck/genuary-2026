export default function day24(p) {
  p.setup = () => {
    p.createCanvas(1080, 1350);

    p.noLoop();
  };

  p.draw = () => {
    p.background(255);

    p.strokeWeight(4);
    p.fill(255);

    const w = 54;
    const numRows = p.floor(p.height / w) - 2;
    const numCols = p.floor(p.width / (2 * w)) - 1;

    const o = { x: w, y: w };

    const tiles = [];

    for (let i = 0; i < numRows; i++) {
      let y = o.y + i * w;

      let rowOffset = 0;
      let cols = numCols;
      if (i % 4 === 2 || i % 4 === 3) {
        rowOffset = -4 * w;
        cols += 1;
      }

      let j0 = i % 4 === 2 ? 1 : 0;

      for (let j = j0; j < cols; j++) {
        let x = o.x + 2 * j * w + (i % 4) * w + rowOffset;

        // this is nasty
        if (i == numRows - 1 && j % 2 !== 0) {
          tiles.push({ x: x, y: y - w, w: w, h: 2 * w });
          tiles.push({ x: x + w, y: y, w: w, h: w });
        } else if (
          (y == o.y && j % 2 !== 0) ||
          (x > o.x + 2 * w * (cols - 1) && j % 2 === 0)
        ) {
          tiles.push({ x: x, y: y, w: w, h: w });
        } else if (x < o.x && j % 2 === 0) {
          tiles.push({ x: x + w, y: y, w: w, h: w });
        } else if (j % 2 === 0) {
          tiles.push({ x: x, y: y, w: 2 * w, h: w });
        } else {
          tiles.push({ x: x, y: y - w, w: w, h: 2 * w });
        }
      }
    }

    const idx = p.floor(p.random(tiles.length));
    for (let i = 0; i < tiles.length; i++) {
      if (i === idx) continue;

      p.push();
      p.translate(tiles[i].x + tiles[i].w / 2, tiles[i].y + tiles[i].h / 2);
      p.rect(-tiles[i].w / 2, -tiles[i].h / 2, tiles[i].w, tiles[i].h);
      p.pop();
    }

    tiles[idx].x += p.randomGaussian(0, 5);
    tiles[idx].y += p.randomGaussian(0, 5);

    p.push();
    p.translate(
      tiles[idx].x + tiles[idx].w / 2,
      tiles[idx].y + tiles[idx].h / 2,
    );
    p.rotate(p.randomGaussian(0, 0.05));
    p.rect(-tiles[idx].w / 2, -tiles[idx].h / 2, tiles[idx].w, tiles[idx].h);
    p.pop();
  };
}

// export default function day24(p) {
//   let res, numRows, numCols, grid;

//   p.setup = () => {
//     p.createCanvas(1000, 1400);

//     res = 100;
//     numRows = p.floor(p.height / res);
//     numCols = p.floor(p.width / res);

//     grid = Array(numRows * numCols)
//       .fill(0)
//       .map((u) => ({ isSeed: false, group: 0 }));

//     for (let i = 0; i < 2; i++) {
//       let idx;
//       do {
//         idx = p.floor(p.random(grid.length));
//       } while (grid[idx].isSeed);

//       grid[idx] = { isSeed: true, group: p.random(100, 255) };
//     }

//     p.noLoop();
//   };

//   p.draw = () => {
//     p.background(0);
//     p.noStroke();
//     p.strokeWeight(2);

//     const newGrid = [...grid];

//     for (let i = 0; i < 1; i++) {
//       for (let j = 0; j < grid.length; j++) {
//         if (grid[j].isSeed || grid[j].value > 1e-6) continue;

//         let { x, y } = flatIndexToXY(j, numCols);

//         const { l, r, t, b } = getNeighborIndexes(x, y, numRows, numCols);

//         const candidates = [l, r, t, b].filter((idx) => grid[idx].group > 0);

//         if (!candidates.length) continue;

//         const idx = p.random(candidates);
//         newGrid[j].group = grid[idx].group;
//       }
//     }

//     grid = newGrid;

//     for (let i = 0; i < grid.length; i++) {
//       let { x, y } = flatIndexToXY(i, numCols);

//       if (grid[i].isSeed) {
//         p.stroke("red");
//       } else {
//         p.noStroke();
//       }

//       p.fill(grid[i].group);
//       p.rect(x * res, y * res, res, res);
//     }
//   };

//   function XYToFlatIndex(x, y, numCols) {
//     return x + y * numCols;
//   }

//   function flatIndexToXY(index, numCols) {
//     return { x: index % numCols, y: p.floor(index / numCols) };
//   }

//   function getNeighborIndexes(x, y, numRows, numCols) {
//     const lIdx = XYToFlatIndex((x - 1 + numCols) % numCols, y, numCols);
//     const rIdx = XYToFlatIndex((x + 1) % numCols, y, numCols);
//     const tIdx = XYToFlatIndex(x, (y - 1 + numRows) % numRows, numCols);
//     const bIdx = XYToFlatIndex(x, (y + 1) % numRows, numCols);

//     return { l: lIdx, r: rIdx, t: tIdx, b: bIdx };
//   }
// }

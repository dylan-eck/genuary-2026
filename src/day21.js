export default function dat21(p) {
  let grid = [];
  const cellSize = 216;
  let numRows, numCols;

  const B = 0;
  const U = 1;
  const R = 2;
  const D = 3;
  const L = 4;

  let tiles = [];

  const rules = [
    [
      // blank
      [B, U],
      [B, R],
      [B, D],
      [B, L],
    ],
    [
      // up
      [R, L, D],
      [L, U, D],
      [B, D],
      [R, U, D],
    ],
    [
      // right
      [R, L, D],
      [L, U, D],
      [R, L, U],
      [B, L],
    ],
    [
      // down
      [B, U],
      [L, U, D],
      [R, L, U],
      [R, U, D],
    ],
    [
      // left
      [R, L, D],
      [B, R],
      [R, L, U],
      [U, D, R],
    ],
  ];

  p.setup = function () {
    p.createCanvas(1080, 1296);
    p.noFill();
    p.stroke(
      p.random([
        "#d3c2ae",
        "#00608d",
        "#6e6f73",
        "#f3c74c",
        "#70543d",
        "#1a1a1a",
        "#e97230",
        "#c96680",
        "#b02728",
        "#4a7655",
        "#6a3f93",
      ]),
    );

    numCols = p.floor(p.width / cellSize);
    numRows = p.floor(p.height / cellSize);

    for (let i = 0; i < numRows * numCols; i++) {
      grid.push({
        state: [0, 1, 2, 3, 4],
      });
    }
  };

  p.draw = function () {
    // Find the minimum entropy among undecided cells
    let minLength = Infinity;
    for (const cell of grid) {
      if (cell.state.length > 1 && cell.state.length < minLength) {
        minLength = cell.state.length;
      }
    }

    // Collect indices of cells with that min entropy
    const candidateIndices = [];
    grid.forEach((cell, i) => {
      if (cell.state.length === minLength && cell.state.length > 1) {
        candidateIndices.push(i);
      }
    });

    if (candidateIndices.length === 0) {
      console.log("done!");
      p.noLoop();
      return;
    }

    // Pick random index and collapse the original grid cell
    const targetIndex = p.random(candidateIndices);
    const chosenState = p.random(grid[targetIndex].state);
    grid[targetIndex].state = [chosenState];

    const nextGrid = [];
    let hasContradiction = false;

    for (let i = 0; i < grid.length; i++) {
      const current = grid[i];
      if (current.state.length === 0) {
        nextGrid[i] = { state: [] };
        hasContradiction = true;
        continue;
      }

      // Skip recompute for already collapsed cells
      if (current.state.length === 1) {
        nextGrid[i] = { state: [...current.state] };
        continue;
      }

      let options = [0, 1, 2, 3, 4];

      const { row, col } = indexToRowCol(i);

      const neighbors = {
        up: row > 0 ? grid[rowColToIndex(row - 1, col)] : null,
        right: col < numCols - 1 ? grid[rowColToIndex(row, col + 1)] : null,
        down: row < numRows - 1 ? grid[rowColToIndex(row + 1, col)] : null,
        left: col > 0 ? grid[rowColToIndex(row, col - 1)] : null,
      };

      if (neighbors.up) {
        const allowedFromUp = getUnionAllowed(neighbors.up, 2); // down dir
        options = options.filter((opt) => allowedFromUp.includes(opt));
      }

      if (neighbors.right) {
        const allowedFromRight = getUnionAllowed(neighbors.right, 3); // left dir
        options = options.filter((opt) => allowedFromRight.includes(opt));
      }

      if (neighbors.down) {
        const allowedFromDown = getUnionAllowed(neighbors.down, 0); // up dir
        options = options.filter((opt) => allowedFromDown.includes(opt));
      }

      if (neighbors.left) {
        const allowedFromLeft = getUnionAllowed(neighbors.left, 1); // right dir
        options = options.filter((opt) => allowedFromLeft.includes(opt));
      }

      nextGrid[i] = { state: options };
      if (options.length === 0) {
        hasContradiction = true;
      }
    }

    grid = nextGrid;

    if (hasContradiction) {
      console.log("Contradiction detected; consider restarting.");
    }

    p.background("#f2e5d4");

    for (let i = 0; i < grid.length; i++) {
      const x = (i % numCols) * cellSize;
      const y = Math.floor(i / numCols) * cellSize;

      const cell = grid[i];
      if (cell.state.length === 1) {
        drawCollapsedTile(x, y, cell.state[0]);
      } else if (cell.state.length === 0) {
        p.fill(255, 0, 0);
        p.rect(x, y, cellSize, cellSize);
        p.noFill();
      } else {
        p.fill(255, 0, 0);
        p.rect(x, y, cellSize, cellSize);
        p.noFill();
      }
    }
  };

  p.keyPressed = () => {
    if (p.key === "s") {
      p.save("out.png");
    }
  };

  function drawCollapsedTile(x, y, state) {
    const margin = 0.1;
    const n = 11;
    p.strokeWeight(9);
    p.strokeCap(p.SQUARE);

    const flip = p.random() < 0.5;

    if (state === B) {
      return;
    }

    if (state === D) {
      const cx = flip ? x : x + cellSize;
      const arcStart = flip ? (p.PI * 3) / 2 : p.PI;
      const arcEnd = flip ? p.TWO_PI : (p.PI * 3) / 2;

      for (let i = 0; i < n; i++) {
        const dia = p.lerp(
          2 * cellSize * margin,
          2 * cellSize * (1 - margin),
          i / (n - 1),
        );

        p.arc(cx, y + cellSize, dia, dia, arcStart, arcEnd);

        const yl = p.lerp(
          y + margin * cellSize,
          y + (1 - margin) * cellSize,
          i / (n - 1),
        );

        const a = y + cellSize - yl;
        const r = cellSize * (1 - margin);
        const b = p.sqrt(Math.max(0, r * r - a * a));

        if (flip) {
          p.line(cx + b, yl, x + cellSize, yl);
        } else {
          p.line(x, yl, cx - b, yl);
        }
      }
    }

    if (state === U) {
      const cx = flip ? x + cellSize : x;
      const arcStart = flip ? p.PI / 2 : 0;
      const arcEnd = flip ? p.PI : p.PI / 2;

      for (let i = 0; i < n; i++) {
        const dia = p.lerp(
          2 * cellSize * margin,
          2 * cellSize * (1 - margin),
          i / (n - 1),
        );

        p.arc(cx, y, dia, dia, arcStart, arcEnd);

        const yl = p.lerp(
          y + (1 - margin) * cellSize,
          y + margin * cellSize,
          i / (n - 1),
        );

        const a = Math.abs(yl - y);
        const r = cellSize * (1 - margin);
        const b = p.sqrt(Math.max(0, r * r - a * a));

        if (flip) {
          p.line(x, yl, cx - b, yl);
        } else {
          p.line(cx + b, yl, x + cellSize, yl);
        }
      }
    }

    if (state === L) {
      for (let i = 0; i < n; i++) {
        const dia = p.lerp(
          2 * cellSize * margin,
          2 * cellSize * (1 - margin),
          i / (n - 1),
        );

        p.arc(x, y + cellSize, dia, dia, -p.PI / 2, 0);

        const xl = p.lerp(
          x + (1 - margin) * cellSize,
          x + margin * cellSize,
          i / (n - 1),
        );

        const a = xl - x;
        const r = cellSize * (1 - margin);
        const bb = r * r - a * a;
        const b = p.sqrt(Math.max(0, bb));

        p.line(xl, y, xl, y + cellSize - b);
      }
    }

    if (state === R) {
      for (let i = 0; i < n; i++) {
        const dia = p.lerp(
          2 * cellSize * margin,
          2 * cellSize * (1 - margin),
          i / (n - 1),
        );

        p.arc(x + cellSize, y + cellSize, dia, dia, p.PI, (p.PI * 3) / 2);

        const xl = p.lerp(
          x + margin * cellSize,
          x + (1 - margin) * cellSize,
          i / (n - 1),
        );

        const a = x + cellSize - xl;
        const r = cellSize * (1 - margin);
        const bb = r * r - a * a;
        const b = p.sqrt(Math.max(0, bb));

        p.line(xl, y, xl, y + cellSize - b);
      }
    }
  }

  function getUnionAllowed(neighbor, dirIndex) {
    const allowed = new Set();
    for (const state of neighbor.state) {
      rules[state][dirIndex].forEach((s) => allowed.add(s));
    }
    return Array.from(allowed);
  }

  function indexToRowCol(i) {
    return {
      row: Math.floor(i / numCols),
      col: i % numCols,
    };
  }

  function rowColToIndex(row, col) {
    return row * numCols + col;
  }
}

// export default function day21(p) {
//   const grid = [];
//   const cellSize = 216;
//   let numRows, numCols;

//   p.setup = () => {
//     p.createCanvas(1080, 1350);

//     numCols = p.floor(p.width / cellSize);
//     numRows = p.floor(p.height / cellSize);

//     const x0 = (p.width % cellSize) / 2;
//     const y0 = (p.height % cellSize) / 2;

//     for (let i = 0; i < numCols; i++) {
//       const x = x0 + i * cellSize;
//       for (let j = 0; j < numRows; j++) {
//         const y = y0 + j * cellSize;

//         grid.push({
//           x: x,
//           y: y,
//           w: cellSize,
//           h: cellSize,
//         });
//       }
//     }

//     p.noLoop();
//   };

//   p.draw = () => {
//     p.background(255);

//     // p.stroke(0);
//     // p.strokeWeight(1);
//     p.noFill();

//     for (const cell of grid) {
//       const { x, y, w, h } = cell;
//       p.rect(x, y, w, h);
//       drawTile(
//         cell,
//         p.random([
//           // 0b0011, // bottom to right
//           // 0b1001, // left to right
//           // 0b0110, // top to bottom
//           // 0b1010, // left to bottom
//           // 0b1100, // left to top
//           // 0b0101, // top to right
//           // 0b1111, // cross
//           // 0b0111, // top bottom and right
//           // 0b1110, // top bottom and left
//           0b1011, // left right and bottom
//         ]),
//       );
//     }
//   };

//   function drawTile(cell, state) {
//     const margin = 0.1;
//     const n = 11;

//     p.push();
//     p.stroke(0);
//     p.strokeCap(p.SQUARE);
//     p.strokeWeight(9);

//     switch (state) {
//       case 0b0110:
//         for (let i = 0; i < n; i++) {
//           const x = p.map(
//             i,
//             0,
//             n - 1,
//             cell.x + cell.w * margin,
//             cell.x + cell.w * (1 - margin),
//           );

//           p.line(x, cell.y, x, cell.y + cell.h);
//         }

//         break;

//       case 0b1001:
//         for (let i = 0; i < n; i++) {
//           const y = p.map(
//             i,
//             0,
//             n - 1,
//             cell.y + cell.h * margin,
//             cell.y + cell.h * (1 - margin),
//           );

//           p.line(cell.x, y, cell.x + cell.w, y);
//         }

//         break;

//       case 0b1100:
//         for (let i = 0; i < n; i++) {
//           const w = p.map(
//             i,
//             0,
//             n - 1,
//             2 * cell.w * margin,
//             2 * cell.w * (1 - margin),
//           );
//           const h = p.map(
//             i,
//             0,
//             n - 1,
//             2 * cell.h * margin,
//             2 * cell.h * (1 - margin),
//           );

//           p.arc(cell.x, cell.y, w, h, 0, p.PI / 2);
//         }

//         break;

//       case 0b0101:
//         for (let i = 0; i < n; i++) {
//           const w = p.map(
//             i,
//             0,
//             n - 1,
//             2 * cell.w * margin,
//             2 * cell.w * (1 - margin),
//           );
//           const h = p.map(
//             i,
//             0,
//             n - 1,
//             2 * cell.h * margin,
//             2 * cell.h * (1 - margin),
//           );

//           p.arc(cell.x + cell.w, cell.y, w, h, p.PI / 2, p.PI);
//         }

//         break;

//       case 0b0011:
//         for (let i = 0; i < n; i++) {
//           const w = p.map(
//             i,
//             0,
//             n - 1,
//             2 * cell.w * margin,
//             2 * cell.w * (1 - margin),
//           );
//           const h = p.map(
//             i,
//             0,
//             n - 1,
//             2 * cell.h * margin,
//             2 * cell.h * (1 - margin),
//           );

//           p.arc(cell.x + cell.w, cell.y + cell.h, w, h, p.PI, (p.PI * 3) / 2);
//         }

//         break;

//       case 0b1010:
//         for (let i = 0; i < n; i++) {
//           const w = p.map(
//             i,
//             0,
//             n - 1,
//             2 * cell.w * margin,
//             2 * cell.w * (1 - margin),
//           );
//           const h = p.map(
//             i,
//             0,
//             n - 1,
//             2 * cell.h * margin,
//             2 * cell.h * (1 - margin),
//           );

//           p.arc(cell.x, cell.y + cell.h, w, h, (p.PI * 3) / 2, 0);
//         }

//         break;

//       case 0b1110:
//         for (let i = 0; i < n; i++) {
//           const d = p.map(
//             i,
//             0,
//             n - 1,
//             2 * cell.w * margin,
//             2 * cell.w * (1 - margin),
//           );

//           p.arc(cell.x, cell.y, d, d, 0, p.PI / 2);

//           const x = p.map(
//             i,
//             0,
//             n - 1,
//             cell.x + cell.w * margin,
//             cell.x + cell.w * (1 - margin),
//           );

//           const a = x - cell.x;
//           const r = cell.w * (1 - margin);
//           const b = p.sqrt(r * r - a * a);

//           p.line(x, cell.y + b, x, cell.y + cell.h);
//         }

//         break;

//       case 0b0111:
//         for (let i = 0; i < n; i++) {
//           const d = p.map(
//             i,
//             0,
//             n - 1,
//             2 * cell.w * margin,
//             2 * cell.w * (1 - margin),
//           );

//           p.arc(cell.x + cell.w, cell.y, d, d, p.PI / 2, p.PI);

//           const x = p.map(
//             i,
//             0,
//             n - 1,
//             cell.x + cell.w * margin,
//             cell.x + cell.w * (1 - margin),
//           );

//           const a = cell.x + cell.w - x;
//           const r = cell.w * (1 - margin);
//           const b = p.sqrt(r * r - a * a);

//           p.line(x, cell.y + b, x, cell.y + cell.h);
//         }

//         break;

//       case 0b1011:
//         for (let i = 0; i < n; i++) {
//           const d = p.map(
//             i,
//             0,
//             n - 1,
//             2 * cell.w * margin,
//             2 * cell.w * (1 - margin),
//           );

//           p.arc(cell.x, cell.y + cell.h, d, d, (p.PI * 3) / 2, p.TWO_PI);

//           const y = p.map(
//             i,
//             0,
//             n - 1,
//             cell.y + cell.h * margin,
//             cell.y + cell.h * (1 - margin),
//           );

//           const a = cell.y + cell.h - y;
//           const r = cell.h * (1 - margin);
//           const b = p.sqrt(r * r - a * a);

//           p.line(cell.x + b, y, cell.x + cell.w, y);
//         }

//         break;

//       case 0b1111:
//         for (let i = 0; i < n; i++) {
//           const x = p.map(
//             i,
//             0,
//             n - 1,
//             cell.x + cell.w * margin,
//             cell.x + cell.w * (1 - margin),
//           );

//           p.line(x, cell.y, x, cell.y + cell.h);

//           const y = p.map(
//             i,
//             0,
//             n - 1,
//             cell.y + cell.h * margin,
//             cell.y + cell.h * (1 - margin),
//           );

//           p.line(cell.x, y, cell.x + cell.w * margin, y);
//           p.line(cell.x + cell.w * (1 - margin), y, cell.x + cell.w, y);
//         }

//         break;
//     }

//     p.pop();
//   }
// }

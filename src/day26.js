export default function day26(p) {
  const RECORD_FRAME_COUNT = 60 * 60;

  const NUM_POINTS = 256;
  const RAD = 400;
  const AMP = 100;
  const NOISE_SCALE = 2;
  const SPEED = 0.015;
  const MARGIN_PX = 50;
  const MAX_DEPTH = 18;

  let gradient = culori.interpolate(["#96F3D7", "#178078"], "oklch");

  class Cell {
    constructor(x, y, w, h, d = 0) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.d = d;
    }

    show() {
      p.rect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);
    }

    splitH() {
      return [
        new Cell(this.x, this.y, this.w / 2, this.h, this.d + 1),
        new Cell(this.x + this.w / 2, this.y, this.w / 2, this.h, this.d + 1),
      ];
    }

    splitV() {
      return [
        new Cell(this.x, this.y, this.w, this.h / 2, this.d + 1),
        new Cell(this.x, this.y + this.h / 2, this.w, this.h / 2, this.d + 1),
      ];
    }

    containsPoint(point) {
      return (
        point.x >= this.x &&
        point.x <= this.x + this.w &&
        point.y >= this.y &&
        point.y <= this.y + this.h
      );
    }
  }

  p.setup = () => {
    p.createCanvas(1080, 1920);
    // p.frameRate(10);
  };

  p.draw = () => {
    p.background(255);
    p.noStroke();

    const yOffset =
      400 * p.sin(0.2 * SPEED * p.frameCount) +
      (p.noise(0.002 * p.frameCount + 300) * 2 - 1);

    const path = [];
    for (let i = 0; i < NUM_POINTS; i++) {
      const t = i / NUM_POINTS;
      const theta = p.lerp(0, p.TAU, t);

      const n = p.noise(
        NOISE_SCALE * p.cos(theta) + 100,
        NOISE_SCALE * p.sin(theta) + 100,
        SPEED * p.frameCount,
      );

      const r = RAD + AMP * (n - 0.5) * 2;

      path.push({
        x: p.width / 2 + r * p.cos(theta),
        y: p.height / 2 + r * p.sin(theta) + yOffset,
      });
    }

    p.noFill();

    let grid = [
      new Cell(
        MARGIN_PX,
        MARGIN_PX,
        p.width - 2 * MARGIN_PX,
        p.height - 2 * MARGIN_PX,
      ),
    ];

    for (let i = 0; i < MAX_DEPTH; i++) {
      let newGrid = [];
      for (const cell of grid) {
        let containsPath = false;
        for (const point of path) {
          if (cell.containsPoint(point)) {
            containsPath = true;
            break;
          }
        }

        if (containsPath) {
          let newCells;

          if (cell.w > cell.h) {
            newCells = cell.splitH();
          } else {
            newCells = cell.splitV();
          }

          newGrid.push(...newCells);
        } else {
          newGrid.push(cell);
        }
      }
      grid = newGrid;
    }

    grid.forEach((c) => {
      const t = 1 - c.d / MAX_DEPTH;
      p.fill(culori.formatHex(gradient(t)));
      c.show();
    });

    // if (p.frameCount <= RECORD_FRAME_COUNT) {
    //   const frameNum = `${p.frameCount}`.padStart(4, "0");
    //   p.save(`${frameNum}.png`);
    // } else {
    //   p.noLoop();
    // }
  };
}

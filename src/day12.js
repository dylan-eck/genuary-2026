export default function day12(p) {
  const GRID_SIZE = { x: 12, y: 24, z: 12 };
  const DISP_SIZE = {
    x: 600,
    y: 1200,
    z: 600,
  };
  const SCALE = {
    x: DISP_SIZE.x / (GRID_SIZE.x - 1),
    y: DISP_SIZE.y / (GRID_SIZE.y - 1),
    z: DISP_SIZE.z / (GRID_SIZE.z - 1),
  };

  const STEP_SECONDS = 1;
  const FRAME_RATE = 60;
  const STEP_FRAMES = FRAME_RATE * STEP_SECONDS;
  let totalLoopFrames;

  let grid = [];
  let paths = [];
  let boxes = [];
  let gradient;

  class Box {
    constructor(path) {
      this.path = path;
      this.currPos = path[0];
      this.idxA = 0;
      this.idxB = 1;
      this.last_t = 0;
      this.direction = 1;
      this.color = culori.formatHex(
        gradient((getDispPoint(path[0]).y + DISP_SIZE.y / 2) / DISP_SIZE.y)
      );
    }

    update(t) {
      if (t < this.last_t) {
        this.idxA = this.idxB;
        this.idxB = this.idxA + this.direction;

        if (this.idxB >= this.path.length || this.idxB < 0) {
          this.direction *= -1;
          this.idxB = this.idxA + this.direction;
        }
      }

      const a = getDispPoint(this.path[this.idxA]);
      const b = getDispPoint(this.path[this.idxB]);
      this.currPos = p5.Vector.lerp(a, b, easeInOutExpo(t));

      this.last_t = t;
    }

    show() {
      const s = 0.8;
      p.push();
      p.stroke(0);
      p.strokeWeight(1);
      p.fill(this.color);
      p.translate(this.currPos);
      p.box(s * SCALE.x, s * SCALE.y, s * SCALE.z);
      p.pop();
    }
  }

  p.setup = () => {
    p.createCanvas(1080, 1920, p.WEBGL);
    p.camera(700, -700, 700, 0, 0, 0);
    // p.frameRate(10);

    gradient = culori.interpolate(["yellow", "red"], "oklch");

    let evenPoints = [];

    const w = GRID_SIZE.x;
    const h = GRID_SIZE.y;
    const d = GRID_SIZE.z;

    for (let i = 0; i < w * h * d; i++) {
      const x = i % w;
      const y = p.floor(i / w) % h;
      const z = p.floor(i / (w * h));

      const pt = p.createVector(x, y, z);
      pt.prev = null;
      pt.next = null;

      grid.push(pt);
      if ((x + y + z) % 2 === 0) {
        evenPoints.push(pt);
      }
    }

    evenPoints = p.shuffle(evenPoints);
    for (const pt of evenPoints) {
      const prevCandidates = getNeighbors(pt).filter((n) => n.next === null);
      const prev = p.random(prevCandidates) ?? null;

      const nextCandidates = getNeighbors(pt).filter(
        (n) => n !== prev && n.prev === null
      );
      const next = p.random(nextCandidates) ?? null;

      if (prev !== null) {
        pt.prev = prev;
        prev.next = pt;
      }

      if (next !== null) {
        pt.next = next;
        next.prev = pt;
      }
    }

    let visited = new Set();
    let maxLength = 20;

    for (const pt of grid) {
      if (visited.has(pt)) continue;

      let start = pt;
      while (start.prev && start.prev !== pt) {
        start = start.prev;
      }

      let path = [];
      let curr = start;
      do {
        path.push(curr);
        visited.add(curr);
        curr = curr.next;
      } while (curr && curr !== start);

      paths.push(path);
    }

    let newPaths = [];
    for (const path of paths) {
      if (path.length <= maxLength) {
        newPaths.push(path);
      } else {
        for (let i = 0; i < path.length; i += maxLength) {
          const subPath = path.slice(i, i + maxLength);
          newPaths.push(subPath);
        }
      }
    }
    paths = newPaths;

    paths = paths.filter((path) => path.length > 1);

    console.log(paths);

    const maxPathLength = p.max(paths.map((path) => path.length));
    const loopStepCount = maxPathLength + (maxPathLength - 1);
    totalLoopFrames = loopStepCount * STEP_FRAMES;
    console.log(totalLoopFrames);

    for (const path of paths) {
      boxes.push(new Box(path));
    }
  };

  p.draw = () => {
    p.background(0);
    p.ortho();

    const t = (p.frameCount % STEP_FRAMES) / (STEP_FRAMES - 1);
    boxes.map((b) => b.update(t));
    boxes.map((b) => b.show());

    for (const path of paths) {
      p.stroke(80);
      p.strokeWeight(2);
      p.noFill();

      for (let i = 0; i < path.length - 1; i++) {
        const p1 = getDispPoint(path[i]);
        const p2 = getDispPoint(path[i + 1]);
        p.line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }

    // if (p.frameCount <= totalLoopFrames) {
    //   const frameNum = `${p.frameCount}`.padStart(4, "0");
    //   p.save(`${frameNum}.png`);
    // } else {
    //   p.noLoop();
    // }
  };

  function getNeighbors(pt) {
    const neighbors = [];

    if (pt.x > 0)
      neighbors.push(
        grid[pt.x - 1 + pt.y * GRID_SIZE.x + pt.z * GRID_SIZE.x * GRID_SIZE.y]
      );

    if (pt.x < GRID_SIZE.x - 1)
      neighbors.push(
        grid[pt.x + 1 + pt.y * GRID_SIZE.x + pt.z * GRID_SIZE.x * GRID_SIZE.y]
      );

    if (pt.y > 0)
      neighbors.push(
        grid[pt.x + (pt.y - 1) * GRID_SIZE.x + pt.z * GRID_SIZE.x * GRID_SIZE.y]
      );

    if (pt.y < GRID_SIZE.y - 1)
      neighbors.push(
        grid[pt.x + (pt.y + 1) * GRID_SIZE.x + pt.z * GRID_SIZE.x * GRID_SIZE.y]
      );

    if (pt.z > 0)
      neighbors.push(
        grid[pt.x + pt.y * GRID_SIZE.x + (pt.z - 1) * GRID_SIZE.x * GRID_SIZE.y]
      );

    if (pt.z < GRID_SIZE.z - 1)
      neighbors.push(
        grid[pt.x + pt.y * GRID_SIZE.x + (pt.z + 1) * GRID_SIZE.x * GRID_SIZE.y]
      );

    return neighbors;
  }

  function getDispPoint(pt) {
    return p.createVector(
      (pt.x - (GRID_SIZE.x - 1) / 2) * SCALE.x,
      (pt.y - (GRID_SIZE.y - 1) / 2) * SCALE.y,
      (pt.z - (GRID_SIZE.z - 1) / 2) * SCALE.z
    );
  }

  function easeInOutExpo(x) {
    return x === 0
      ? 0
      : x === 1
      ? 1
      : x < 0.5
      ? Math.pow(2, 20 * x - 10) / 2
      : (2 - Math.pow(2, -20 * x + 10)) / 2;
  }
}

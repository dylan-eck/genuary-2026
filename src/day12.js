export default function day12(p) {
  const GRID_SIZE = { x: 4, y: 4, z: 4 };
  const DISP_SIZE = {
    x: 500,
    y: 500,
    z: 500,
  };
  const SCALE = {
    x: DISP_SIZE.x / (GRID_SIZE.x - 1),
    y: DISP_SIZE.y / (GRID_SIZE.y - 1),
    z: DISP_SIZE.z / (GRID_SIZE.z - 1),
  };

  const LOOP_SECONDS = 10;
  const FRAME_RATE = 60;
  const LOOP_FRAMES = FRAME_RATE * LOOP_SECONDS;

  let grid = [];
  let paths = [];

  let pathIdx = 0;
  let currPos;
  let nextPos;
  let segStartPos;
  let path;

  p.setup = () => {
    p.createCanvas(800, 800, p.WEBGL);
    p.camera(800, -700, 700, 0, 0, 0);

    let evenPoints = [];

    const w = GRID_SIZE.x;
    const h = GRID_SIZE.y;
    const d = GRID_SIZE.z;

    for (let i = 0; i < w * h * d; i++) {
      const x = i % w;
      const y = p.floor(i / w) % h;
      const z = p.floor(i / (w * h));

      const pt = { x, y, z, prev: null, next: null };
      grid.push(pt);

      if ((x + y + z) % 2 === 0) {
        evenPoints.push(pt);
      }
    }

    for (const pt of evenPoints) {
      const prevCandidates = getNeighbors(pt).filter((n) => n.next === null);
      const prev = p.random(prevCandidates) ?? null;

      const nextCandidates = getNeighbors(pt).filter(
        (n) => n !== prev && n.prev === null
      );
      const next = p.random(nextCandidates) ?? null;

      if (prev === null || next === null) break;

      if (prev !== null) {
        pt.prev = prev;
        prev.next = pt;
      }

      if (next !== null) {
        pt.next = next;
        next.prev = pt;
      }
    }

    let unvisited = new Set(grid);
    while (unvisited.size) {
      const strt = unvisited.values().next().value;
      let path = [strt];
      unvisited.delete(strt);

      let curr = strt.next;
      while (curr && curr !== strt) {
        path.push(curr);
        unvisited.delete(curr);
        curr = curr.next;
      }

      paths.push(path);
    }

    // path = paths[0];
    // currPos = path[pathIdx];
    // segStartPos = currPos.copy;
    // nextPos = path[pathIdx + 1];
  };

  p.draw = () => {
    // const t = (p.frameCount % LOOP_FRAMES) / LOOP_FRAMES;
    // const segments = path.length;
    // const totalSegments = path.length * 3;
    // const u = t * totalSegments;
    // const pathIdx = p.floor(u) % path.length;
    // const nextIdx = (pathIdx + 1) % path.length;
    // const segTRaw = u % 1;
    // const segTEased = easeInOutExpo(segTRaw);

    // currPos = p5.Vector.lerp(path[pathIdx], path[nextIdx], segTEased);

    // if (segTRaw > 0.99) {
    //   let nextPathIdx = (pathIdx + 1) % path.length;

    //   segStartPos = path[pathIdx].copy();
    //   nextPos = path[nextPathIdx];
    // }

    p.orbitControl();
    p.background(150);

    p.stroke(0);
    p.strokeWeight(1);
    p.noFill();
    p.box(DISP_SIZE.x, DISP_SIZE.y, DISP_SIZE.z);

    for (const path of paths) {
      p.stroke("green");
      p.strokeWeight(4);
      p.noFill();

      for (let i = 0; i < path.length - 1; i++) {
        const p1 = getDispPoint(path[i]);
        const p2 = getDispPoint(path[i + 1]);
        p.line(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      }
    }

    p.push();
    p.stroke(0);
    p.strokeWeight(1);
    p.fill(255);
    p.translate(currPos);
    p.box(20);
    p.pop();
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
    return {
      x: (pt.x - (GRID_SIZE.x - 1) / 2) * SCALE.x,
      y: (pt.y - (GRID_SIZE.y - 1) / 2) * SCALE.y,
      z: (pt.z - (GRID_SIZE.z - 1) / 2) * SCALE.z,
    };
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

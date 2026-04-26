export default function sketch(p, seed) {
  const MAX_ITERATIONS = 5000;
  const MIN_BRANCH_WIDTH = 10;
  const MIN_BRANCH_HEIGHT = 10;
  const JITTER_AMOUNT = 0.2;
  const MARGIN_PX = 50;

  const MAX_DIST = 100;
  const MIN_DIST = 50;

  const NUM_LEAVES = 800;
  let leaves = [];
  let branches = [];

  let gradient;

  let current;
  let trunkComplete = false;

  p.setup = () => {
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.createCanvas(1080, 1920);
    // p.frameRate(10);

    gradient = culori.interpolate(["#5d431c", "#478d26"], "oklch");

    leaves = Array(NUM_LEAVES)
      .fill()
      .map((_) => ({
        pos: p.createVector(
          p.random(MARGIN_PX, p.width - 2 * MARGIN_PX),
          p.random(MARGIN_PX, (2 / 3) * (p.height - 2 * MARGIN_PX)),
        ),
        reached: false,
      }));

    branches.push({
      pos: p.createVector(p.width / 2, p.height),
      dir: p.createVector(0, -1),
      originalDir: p.createVector(0, -1),
      parent: null,
      count: 0,
      depth: 0,
      jitter: p.randomGaussian(0, JITTER_AMOUNT),
    });

    current = branches.at(-1);
  };

  p.draw = () => {
    // TODO: could maybe use a quadtree to speed this up
    if (p.frameCount % 8 === 0) {
      if (!trunkComplete) {
        for (const leaf of leaves) {
          const d = p5.Vector.dist(current.pos, leaf.pos);
          if (d <= MAX_DIST) {
            trunkComplete = true;
            break;
          }
        }

        if (!trunkComplete) {
          branches.push({
            pos: p5.Vector.add(current.pos, p5.Vector.mult(current.dir, 100)),
            dir: current.dir.copy(),
            originalDir: current.dir.copy(),
            parent: current,
            depth: current.depth + 1,
            jitter: p.randomGaussian(0, JITTER_AMOUNT),
          });

          current = branches.at(-1);
        }
      } else {
        for (const leaf of leaves) {
          let closestBranch = null;
          let dist = 1e9;
          for (const branch of branches) {
            const d = p5.Vector.dist(leaf.pos, branch.pos);

            if (d < MIN_DIST) {
              leaf.reached = true;
              break;
            }

            if (d <= MAX_DIST && (closestBranch === null || d < dist)) {
              closestBranch = branch;
              dist = d;
            }
          }

          if (closestBranch !== null) {
            const newDir = p5.Vector.sub(
              leaf.pos,
              closestBranch.pos,
            ).normalize();
            closestBranch.dir.add(newDir);
            closestBranch.count++;
          }
        }

        for (let i = leaves.length - 1; i >= 0; i--) {
          if (leaves[i].reached) {
            leaves.splice(i, 1);
          }
        }

        for (let i = branches.length - 1; i >= 0; i--) {
          const branch = branches[i];
          if (branch.count === 0) continue;

          branch.dir.div(branch.count);
          branch.count = 0;

          branches.push({
            pos: p5.Vector.add(branch.pos, p5.Vector.mult(branch.dir, 10)),
            dir: branch.dir.copy(),
            originalDir: branch.dir.copy(),
            parent: branch,
            count: 0,
            depth: branch.depth + 1,
            jitter: p.randomGaussian(0, JITTER_AMOUNT),
          });

          branch.dir = branch.originalDir.copy();
        }
      }
    }

    // if (leaves.length >= 10) {
    //   const frameNum = `${p.frameCount}`.padStart(5, "0");
    //   p.save(`${frameNum}.png`);
    // } else {
    //   p.noLoop();
    // }
    // const maxDepth = p.max(...branches.map((b) => b.depth));

    p.background(0);
    p.noStroke();
    branches.forEach((branch) => {
      if (!branch.parent) return;

      const p0 = branch.parent.pos;
      const p1 = branch.pos;

      const x0 = p0.x;
      const y0 = p0.y;
      const x1 = p1.x;
      const y1 = p1.y;

      const x = Math.min(x0, x1);
      const y = Math.min(y0, y1);

      let w = Math.abs(x1 - x0);
      let h = Math.abs(y1 - y0);

      w = Math.max(w, MIN_BRANCH_WIDTH);
      h = Math.max(h, MIN_BRANCH_HEIGHT);

      const t = branch.depth / 40 + branch.jitter;

      p.fill(culori.formatHex(gradient(t * t * t)));
      p.rect(x, y, w, h);
    });
  };
}

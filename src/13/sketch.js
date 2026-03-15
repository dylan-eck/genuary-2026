export default function sketch(p, seed) {
  let scale;
  let flowField;
  const acceleration = 0.05;
  const maxSpeed = 3;
  let rows, cols;
  let paths = [];
  let loading = true;
  let pg;

  function load() {
    p.loadJSON("../data/flow_field.json", (data) => {
      // make sure flow field is an array, not an object
      if (!Array.isArray(data)) {
        data = Object.values(data).map((row) => Object.values(row));
      }
      flowField = data;

      buildFlowField()
        .then(drawFlowField)
        .then(() => {
          p.background(0);
          p.image(pg, 0, 0);
          loading = false;
        });
    });
  }

  function drawSpinner() {
    p.clear();

    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.rotate(0.1 * p.frameCount);

    p.stroke(255);
    p.strokeWeight(8);
    p.noFill();

    const r = 20;
    const n = 6;
    for (let i = 0; i < n; i++) {
      const theta = p.map(i, 0, n, 0, p.TAU);
      p.point(r * p.cos(theta), r * p.sin(theta));
    }

    p.pop();
  }

  p.setup = () => {
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.createCanvas(1080, 1350);
    pg = p.createGraphics(1080, 1350);

    load();
  };

  p.draw = () => {
    if (loading) {
      drawSpinner();
    } else {
      p.noLoop();
    }
  };

  async function buildFlowField() {
    rows = flowField.length;
    cols = flowField[0].length;
    scale = 1080 / cols;

    paths = [];
    const NUM_PATHS = 2000;
    const BATCH_SIZE = 50;

    for (let i = 0; i < NUM_PATHS; i += BATCH_SIZE) {
      const batchEnd = Math.min(i + BATCH_SIZE, NUM_PATHS);

      for (let pathIdx = i; pathIdx < batchEnd; pathIdx++) {
        let path = [{ x: p.random(cols), y: p.random(rows) }];
        let vel = { x: 0, y: 0 };

        for (let j = 0; j < 2000; j++) {
          let x = path.at(-1).x;
          let y = path.at(-1).y;

          const rowIdx = p.floor(y);
          const colIdx = p.floor(x);
          const angle = flowField[rowIdx][colIdx] * p.TAU;

          vel.x += acceleration * p.cos(angle);
          vel.y += acceleration * p.sin(angle);

          const spd = p.sqrt(vel.x * vel.x + vel.y * vel.y);
          if (spd > maxSpeed) {
            vel.x *= maxSpeed / spd;
            vel.y *= maxSpeed / spd;
          }

          let nextX = x + vel.x;
          let nextY = y + vel.y;

          nextX = ((nextX % cols) + cols) % cols;
          nextY = ((nextY % rows) + rows) % rows;

          path.push({ x: nextX, y: nextY });
        }

        paths.push(path);
      }

      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  async function drawFlowField() {
    pg.background(0);
    pg.stroke(255, 255, 255, 20);
    pg.strokeWeight(1);
    pg.noFill();

    const NUM_PATHS = paths.length;
    const BATCH_SIZE = 20;

    for (let i = 0; i < NUM_PATHS; i += BATCH_SIZE) {
      const batchEnd = Math.min(i + BATCH_SIZE, NUM_PATHS);

      for (let pathIdx = i; pathIdx < batchEnd; pathIdx++) {
        const path = paths[pathIdx];

        pg.beginShape();
        let started = false;

        for (let m = 0; m < path.length; m++) {
          const curr = path[m];

          if (m > 0) {
            const prev = path[m - 1];
            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;

            if (Math.abs(dx) > cols / 2 || Math.abs(dy) > rows / 2) {
              pg.endShape();
              pg.beginShape();
              started = false;
              continue;
            }
          }

          pg.vertex(scale * curr.x, scale * curr.y);
          started = true;
        }

        if (started) {
          pg.endShape();
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

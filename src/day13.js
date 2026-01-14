export default function day13(p) {
  let scale;
  let flowField;
  let rows, cols;
  let paths = [];

  p.preload = () => {
    flowField = p.loadJSON("/data/flow_field.json", (data) => {
      // make sure flow field is an array, not an object
      if (!Array.isArray(data)) {
        data = Object.values(data).map((row) => Object.values(row));
      }
      flowField = data;
    });
  };

  p.setup = () => {
    p.createCanvas(1080, 1350);
    p.noLoop();

    rows = flowField.length;
    cols = flowField[0].length;
    scale = 1080 / cols;

    for (let i = 0; i < 2000; i++) {
      let path = [{ x: p.random(cols), y: p.random(rows) }];

      const acceleration = 0.05;
      const maxSpeed = 3;
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

        path.push({
          x: nextX,
          y: nextY,
        });
      }

      paths.push(path);
    }
  };

  p.draw = () => {
    p.background(0);

    p.stroke(255, 255, 255, 20);
    p.strokeWeight(1);
    p.noFill();

    for (const path of paths) {
      p.beginShape();
      let started = false;

      for (let i = 0; i < path.length; i++) {
        const curr = path[i];

        if (i > 0) {
          const prev = path[i - 1];
          const dx = curr.x - prev.x;
          const dy = curr.y - prev.y;

          if (Math.abs(dx) > cols / 2 || Math.abs(dy) > rows / 2) {
            p.endShape();
            p.beginShape();
            started = false;
            continue;
          }
        }

        p.vertex(scale * curr.x, scale * curr.y);
        started = true;
      }

      if (started) {
        p.endShape();
      }
    }
  };

  p.keyPressed = () => {
    if (p.key.toLowerCase() === "s") {
      p.save("out.png");
    }
  };
}

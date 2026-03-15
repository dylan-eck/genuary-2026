export default function sketch(p, seed) {
  const margins = { l: 50, r: 50, t: 50, b: 50 };

  p.setup = () => {
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.createCanvas(800, 1000);
    p.background(255);

    let radius = 16;
    let step = radius / 2;
    let cols = (p.width - margins.l - margins.r - 2 * radius) / (2 * radius);
    let rand = p.floor(p.random(cols - 1));

    for (let i = 0; i < cols; i++) {
      const y = p.height - margins.b - p.random(200);
      const maxLength = y - margins.t;
      const maxSteps = p.floor(maxLength / step);

      let n = p.floor(p.random(10, maxSteps));
      const x = p.map(
        i,
        0,
        cols - 1,
        margins.l + radius,
        p.width - margins.r - radius,
      );
      trail(
        x,
        p.height - margins.b - p.random(100),
        radius,
        n,
        step,
        rand == i,
      );
    }
  };

  p.keyPressed = () => {
    if (p.key === "s" || p.key === "S") {
      p.saveCanvas("out", "png");
    }
  };

  function trail(x, y, radius, count, step, color = false) {
    for (let i = 0; i < count; i++) {
      let alpha = p.map(i, 0, count - 1, 10, 255);

      if (color && i == count - 1) {
        p.noStroke();
        p.fill("red");
      } else {
        p.stroke(0, 0, 0, alpha);
        p.strokeWeight(1);
        p.fill(255, 255, 255, alpha);
      }

      tri(x, y - i * step, radius);
      alpha += 50;
    }
  }

  function tri(x, y, radius) {
    p.beginShape();
    for (let i = 0; i < 3; i++) {
      const theta = (p.TWO_PI / 3) * i - p.PI / 2;
      p.vertex(x + radius * p.cos(theta), y + radius * p.sin(theta));
    }
    p.endShape(p.CLOSE);
  }
}

// const margins = { l: 50, r: 50, t: 50, b: 50 };

// function setup() {
//   createCanvas(800, 1000);
//   background(255);

//   let radius = 16;
//   let step = radius / 2;
//   let cols = (width - margins.l - margins.r - 2 * radius) / (2 * radius);
//   let rand = floor(random(cols - 1));

//   for (let i = 0; i < cols; i++) {
//     const y = height - margins.b - random(200);
//     const maxLength = y - margins.t;
//     const maxSteps = floor(maxLength / step);

//     let n = floor(random(10, maxSteps));
//     const x = map(
//       i,
//       0,
//       cols - 1,
//       margins.l + radius,
//       width - margins.r - radius,
//     );
//     trail(x, height - margins.b - random(100), radius, n, step, rand == i);
//   }
// }

// keyPressed = () => {
//   if (key === "s" || key === "S") {
//     saveCanvas("out", "png");
//   }
// };

// function trail(x, y, radius, count, step, color = false) {
//   for (let i = 0; i < count; i++) {
//     let alpha = map(i, 0, count - 1, 10, 255);

//     if (color && i == count - 1) {
//       noStroke();
//       fill("red");
//     } else {
//       stroke(0, 0, 0, alpha);
//       strokeWeight(1);
//       fill(255, 255, 255, alpha);
//     }

//     tri(x, y - i * step, radius);
//     alpha += 50;
//   }
// }

// function tri(x, y, radius) {
//   beginShape();
//   for (let i = 0; i < 3; i++) {
//     const theta = (TWO_PI / 3) * i - PI / 2;
//     vertex(x + radius * cos(theta), y + radius * sin(theta));
//   }
//   endShape(CLOSE);
// }

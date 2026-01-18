export default function day17(p) {
  const MARGIN_PX = 54;
  const SCALE = 2;
  let s = 3;
  let t = 60;
  let numRows = 19,
    numCols = 11;
  let pg;
  let gradShader;
  let colorA;
  let colorB;

  p.preload = () => {
    gradShader = p.loadShader(
      "src/shaders/day17.vert.glsl",
      "src/shaders/day17.frag.glsl",
    );
  };

  p.setup = () => {
    p.createCanvas(1080, 1350);
    pg = p.createGraphics(p.width, p.height, p.WEBGL);
    pg.camera(-500, -500, -500);
    p.noLoop();

    colorA = {
      mode: "oklch",
      l: 0.4,
      c: 0.1,
      h: p.random(360),
    };

    const hueShift = 40;
    colorB = {
      ...colorA,
      l: colorA.l + 0.2,
      h: (((colorA.h + hueShift) % 360) + 360) % 360,
    };
  };

  p.draw = () => {
    pg.clear();
    pg.noStroke();
    pg.strokeWeight(2);

    pg.ortho(
      (SCALE * -p.width) / 2,
      (SCALE * p.width) / 2,
      (SCALE * -p.height) / 2,
      (SCALE * p.height) / 2,
      0.1,
      2000,
    );

    const lightColor = p.color(255);
    const lightDir = p.createVector(0.3, 1, 0).normalize();
    pg.directionalLight(lightColor, lightDir);
    pg.ambientLight(40);

    pg.shader(gradShader);
    gradShader.setUniform("uInvert", false);
    gradShader.setUniform("uColorA", [colorA.l, colorA.c, colorA.h]);
    gradShader.setUniform("uColorB", [colorB.l, colorB.c, colorB.h]);

    drawLattice(pg);

    gradShader.setUniform("uInvert", true);
    gradShader.setUniform("uColorA", [colorA.l, colorA.c, colorA.h]);
    gradShader.setUniform("uColorB", [colorB.l, colorB.c, colorB.h]);
    pg.push();
    pg.translate(-s * t, 0, -s * t);
    drawLattice(pg);
    pg.pop();

    p.background(255);
    p.beginClip();
    p.rect(
      MARGIN_PX,
      MARGIN_PX,
      p.width - 2 * MARGIN_PX,
      p.height - 2 * MARGIN_PX,
    );
    p.endClip();
    p.fill("#fffaf0");
    p.rect(0, 0, p.width, p.height);

    p.image(pg, 0, 0, p.width, p.height);
  };

  p.keyPressed = () => {
    if (p.key.toLowerCase() === "s") {
      p.save("out.png");
    }
  };

  function drawLattice(r) {
    const spacing = (s - 1) * t + t;
    const dh = s * t * r.sqrt(2);
    const dd = (s * t * r.sqrt(2)) / 2;
    r.push();
    for (let j = 0; j < numRows; j++) {
      r.push();
      r.translate(
        0.5 * r.cos(r.PI / 4) * (dd * (numRows - 1) + dh * (numCols - 1)),
        -(s * t * (numRows - 1)) / 2,
        0.5 * r.sin(r.PI / 4) * (dd * (numRows - 1) - dh * (numCols - 1)),
      );
      const nc = j % 2 === 0 ? numCols : numCols - 1;
      for (let i = 0; i < nc; i++) {
        elem(r, 0, 0, 0, s, t);
        r.translate(-spacing, 0, spacing);
      }
      r.pop();

      if (j % 2 === 0) {
        r.translate(-s * t, s * t, 0);
      } else {
        r.translate(0, s * t, -s * t);
      }
    }
    r.pop();
  }

  function elem(r, x, y, z, d = 3, t = 60) {
    const offset = ((d - 1) * t + t) / 2;
    const armLength = (d - 1) * t;

    r.push();
    r.beginGeometry();
    r.push();
    r.box(t, t, t);
    r.translate(offset, 0, 0);
    r.box(armLength, t, t);
    r.translate(-offset, 0, offset);
    r.box(t, t, armLength);
    r.translate(0, offset, -offset);
    r.box(t, armLength, t);
    r.pop();

    const geo = r.endGeometry();

    r.translate(x, y, z);
    r.model(geo);

    r.pop();
  }
}

// export default function day17(p) {
//   const MARGIN_PX = 50;
//   const SCALE = 2;
//   let s = 3;
//   let t = 60;
//   let numRows = 18;
//   let numCols = 11;
//   let patternLayer;

//   p.setup = () => {
//     p.createCanvas(1080, 1920, p.WEBGL);
//     p.camera(-500, -500, -500);
//     p.noLoop();
//     // p.debugMode(p.AXES, 500, 0, 0, 0);
//   };

//   p.draw = () => {
//     p.background(255);

//     p.ortho(
//       (SCALE * -p.width) / 2,
//       (SCALE * p.width) / 2,
//       (SCALE * -p.height) / 2,
//       (SCALE * p.height) / 2,
//       0.1,
//       2000,
//     );
//     p.orbitControl();

//     p.fill("red");
//     drawLatice();

//     p.push();
//     p.translate(-s * t, 0, -s * t);
//     p.fill("blue");
//     drawLatice();
//     p.pop();
//   };

//   function drawLatice() {
//     const spacing = (s - 1) * t + t;
//     const dh = s * t * p.sqrt(2);
//     const dd = (s * t * p.sqrt(2)) / 2;
//     p.push();
//     for (let j = 0; j < numRows; j++) {
//       p.push();
//       p.translate(
//         0.5 * p.cos(p.PI / 4) * (dd * (numRows - 1) + dh * (numCols - 1)),
//         -(s * t * (numRows - 1)) / 2,
//         0.5 * p.sin(p.PI / 4) * (dd * (numRows - 1) - dh * (numCols - 1)),
//       );
//       const nc = j % 2 === 0 ? numCols : numCols - 1;
//       for (let i = 0; i < nc; i++) {
//         elem(0, 0, 0, s, t);
//         p.translate(-spacing, 0, spacing);
//       }
//       p.pop();

//       if (j % 2 === 0) {
//         p.translate(-s * t, s * t, 0);
//       } else {
//         p.translate(0, s * t, -s * t);
//       }
//     }
//     p.pop();
//   }

//   function elem(x, y, z, d = 50, t = 20) {
//     const offset = ((d - 1) * t + t) / 2;
//     const armLength = (d - 1) * t;

//     p.push();
//     p.beginGeometry();
//     p.push();
//     p.box(t, t, t);
//     p.translate(offset, 0, 0);
//     p.box(armLength, t, t);
//     p.translate(-offset, 0, offset);
//     p.box(t, t, armLength);
//     p.translate(0, offset, -offset);
//     p.box(t, armLength, t);
//     p.pop();

//     p.translate(x, y, z);
//     p.model(p.endGeometry());

//     p.pop();
//   }
// }

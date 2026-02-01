export default function day30(p) {
  const PAPER_W_IN = 9;
  const PAPER_H_IN = 12;
  const UNITS_PER_IN = 100;

  let mask;

  p.setup = () => {
    p.createCanvas(PAPER_W_IN * UNITS_PER_IN, PAPER_H_IN * UNITS_PER_IN, p.SVG);
    p.pixelDensity(1);
    p.noiseSeed(2);

    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);

    // --- offscreen raster buffer ---
    mask = p.createGraphics(p.width, p.height);
    mask.pixelDensity(1);
    mask.background(255);

    mask.push();
    mask.textAlign(p.CENTER, p.CENTER);
    mask.textSize(240);
    mask.noStroke();
    mask.fill(0);
    mask.rotate(p.HALF_PI);
    mask.text("FEATURE", p.height / 2, -p.width / 2);
    mask.pop();

    mask.loadPixels();

    p.background(255);

    let spacing = 20;
    let numLines = p.width / spacing;
    let step = 2;
    let bugRate = 0.2;
    const xm = 300;

    for (let i = 0; i < numLines; i++) {
      const x = p.lerp(xm, p.width - xm, i / (numLines - 1));
      p.beginShape();
      for (let y = 20; y < p.height - 20; y += step) {
        let s = errorStrength(x, y);

        if (p.random() < s * bugRate) {
          let o = bugOffset(x, y, s);
          p.vertex(x + o.x, y + o.y);
        } else {
          p.vertex(x, y);
        }
      }
      p.endShape();
    }

    p.noLoop();
  };

  function errorStrength(x, y) {
    let i = (Math.floor(x) + Math.floor(y) * mask.width) * 4;
    let b = mask.pixels[i];
    let s = 1 - b / 255;
    return Math.pow(s, 1.4);
  }

  function bugOffset(x, y, s) {
    let angle = p.noise(x * 0.01, y * 0.01) * p.TWO_PI * 2;
    let mag = s * 4;
    return p5.Vector.fromAngle(angle).mult(mag);
  }

  p.keyPressed = () => {
    if (p.key === "s" || p.key === "S") {
      p.save("bug_feature.svg");
    }
  };

  // const PAPER_W_IN = 9;
  // const PAPER_H_IN = 12;
  // const UNITS_PER_IN = 100;

  // p.setup = () => {
  //   // p.createCanvas(PAPER_W_IN * UNITS_PER_IN, PAPER_H_IN * UNITS_PER_IN, p.SVG);
  //   p.createCanvas(300, 600, p.SVG);
  //   const svg = document.querySelector("svg");

  //   svg.setAttribute("width", `${PAPER_W_IN}in`);
  //   svg.setAttribute("height", `${PAPER_H_IN}in`);
  //   svg.setAttribute("viewBox", `0 0 ${p.width} ${p.height}`);

  //   p.noiseSeed(2);
  //   p.stroke(0);
  //   p.strokeWeight(1);
  //   p.noFill();

  //   p.background(255);
  //   p.noFill();
  //   p.push();
  //   p.textAlign(p.CENTER, p.CENTER);
  //   p.textSize(120);
  //   p.noStroke();
  //   p.fill(0);
  //   p.rotate(p.HALF_PI);
  //   p.text("FEATURE", p.height / 2, -p.width / 2);
  //   p.pop();

  //   p.loadPixels();
  //   p.background(255);

  //   let spacing = 4;
  //   let step = 1;
  //   let bugRate = 0.2;

  //   for (let x = 20; x < p.width - 20; x += spacing) {
  //     p.beginShape();
  //     for (let y = 20; y < p.height - 20; y += step) {
  //       let s = errorStrength(x, y);

  //       if (p.random() < s * bugRate) {
  //         let o = bugOffset(x, y, s);
  //         p.vertex(x + o.x, y + o.y);
  //       } else {
  //         p.vertex(x, y);
  //       }
  //     }
  //     p.endShape();
  //   }

  //   p.noLoop();
  // };

  // p.keyPressed = () => {
  //   if (p.key.toLowerCase() === "s") {
  //     p.save("out.svg");
  //   }
  // };

  // function errorStrength(x, y) {
  //   let i = (p.floor(x) + p.floor(y) * p.width) * 4;
  //   let b = p.pixels[i];
  //   let s = 1 - b / 255;
  //   return p.pow(s, 1.4);
  // }

  // function bugOffset(x, y, s) {
  //   let angle = noise(x * 0.01, y * 0.01) * p.TWO_PI * 2;
  //   let mag = s * 5;
  //   return p5.Vector.fromAngle(angle).mult(mag);
  // }
}

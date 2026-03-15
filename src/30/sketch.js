export default function sketch(p, seed) {
  const PAPER_W_IN = 9;
  const PAPER_H_IN = 12;
  const UNITS_PER_IN = 100;

  let mask;

  p.setup = () => {
    p.randomSeed(seed);
    p.noiseSeed(seed);
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
}

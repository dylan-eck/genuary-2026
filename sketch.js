const margins = { l: 50, r: 50, t: 50, b: 50 };

function setup() {
  createCanvas(800, 1000);
  background(255);

  let radius = 16;
  let step = radius / 2;
  let cols = (width - margins.l - margins.r - 2 * radius) / (2 * radius);
  let rand = floor(random(cols - 1));

  for (let i = 0; i < cols; i++) {
    const y = height - margins.b - random(200);
    const maxLength = y - margins.t;
    const maxSteps = floor(maxLength / step);

    let n = floor(random(10, maxSteps));
    const x = map(
      i,
      0,
      cols - 1,
      margins.l + radius,
      width - margins.r - radius
    );
    trail(x, height - margins.b - random(100), radius, n, step, rand == i);
  }
}

function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("out", "png");
  }
}

function trail(x, y, radius, count, step, color = false) {
  for (let i = 0; i < count; i++) {
    let alpha = map(i, 0, count - 1, 10, 255);

    if (color && i == count - 1) {
      noStroke();
      fill("red");
    } else {
      stroke(0, 0, 0, alpha);
      strokeWeight(1);
      fill(255, 255, 255, alpha);
    }

    tri(x, y - i * step, radius);
    alpha += 50;
  }
}

function tri(x, y, radius) {
  beginShape();
  for (let i = 0; i < 3; i++) {
    const theta = (TWO_PI / 3) * i - PI / 2;
    vertex(x + radius * cos(theta), y + radius * sin(theta));
  }
  endShape(CLOSE);
}

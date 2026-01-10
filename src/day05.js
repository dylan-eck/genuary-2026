export default function day05(p) {
  const MARGIN = 40;

  p.setup = () => {
    p.createCanvas(1080, 1350);
    p.noLoop();
  };

  p.draw = () => {
    p.background(255);

    p.beginClip();
    p.rect(MARGIN, MARGIN, p.width - 2 * MARGIN, p.height - 2 * MARGIN);
    p.endClip();

    p.translate(p.width / 2, p.height / 2);
    p.rotate(p.randomGaussian(0, p.PI / 8));

    let funcs = [G, E, N, U, A, R, Y];
    const overallWidth = 500 * 1.5;
    const overallHeight = 80 * 1.5;
    const gapPercent = 0.2;
    const cellWidth = overallWidth / funcs.length;

    const x0 = 0;
    const y0 = 0;
    const w = cellWidth * (1 - gapPercent);
    const h = overallHeight;
    const g = cellWidth * gapPercent;

    p.noStroke();
    p.fill(0);
    const countX = 7;
    const countY = 21;
    for (let i = 0; i < countY; i++) {
      const spacing = 10;
      const currY = -(countY / 2) * (h + spacing) + i * (h + 2 * spacing);

      const rowOffset = p.randomGaussian(0, 50);

      for (let j = 0; j < countX; j++) {
        const currX =
          -(countX / 2) * (overallWidth + spacing) +
          j * (overallWidth + spacing) +
          i * rowOffset;

        for (let k = 0; k < funcs.length; k++) {
          funcs[k](currX + k * (w + g), currY + h, w, h);
        }
      }
    }
  };

  p.keyPressed = () => {
    if (p.key === "s" || p.key === "S") {
      p.saveCanvas("out", "png");
    }
  };

  function G(x, y, w, h) {
    p.arc(x + h / 2, y - h / 2, h, h, p.HALF_PI, -p.HALF_PI);
    p.rect(x + h / 2, y - h / 2, w - h / 2, h / 2);
  }

  function E(x, y, w, h) {
    const t = 0.25 * h;

    p.beginShape();
    p.vertex(x, y - h);
    p.vertex(x + w, y - h);
    p.vertex(x + w, y - h + t);
    p.vertex(x, y - h + t);
    p.endShape(p.CLOSE);

    p.beginShape();
    p.vertex(x, y - h / 2 - t / 2);
    p.vertex(x + w, y - h / 2 - t / 2);
    p.vertex(x + w, y - h / 2 + t / 2);
    p.vertex(x, y - h / 2 + t / 2);
    p.endShape(p.CLOSE);

    p.beginShape();
    p.vertex(x, y);
    p.vertex(x + w, y);
    p.vertex(x + w, y - t);
    p.vertex(x, y - t);
    p.endShape(p.CLOSE);
  }

  function N(x, y, w, h) {
    p.beginShape();
    p.vertex(x, y);
    p.vertex(x, y - h);
    p.vertex(x + w / 2, y - h / 2);
    p.vertex(x + w / 2, y - h);
    p.vertex(x + w, y - h);
    p.vertex(x + w, y);
    p.endShape(p.CLOSE);
  }

  function U(x, y, w, h) {
    p.rect(x, y - h, w, h - w / 2);
    p.arc(x + w / 2, y - w / 2, w, w, 0, p.PI);
  }

  function A(x, y, w, h) {
    p.triangle(x, y, x + w / 2, y - h, x + w, y);
  }

  function R(x, y, w, h) {
    p.rect(x, y - h, w / 2, h);
    p.arc(x + w / 2, y - h + w / 2, w, w, -p.HALF_PI, p.HALF_PI);
    p.triangle(x + w / 2, y, x + w / 2, y - h + w, x + w, y);
  }

  function Y(x, y, w, h) {
    p.rect(x, y - h, w / 2, h);
    p.triangle(x + w / 2, y - h, x + w / 2, y - h / 2, x + w, y - h);
  }
}

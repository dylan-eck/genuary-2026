export default function day03(p) {
  const MARGIN = 20;

  let cells;
  let w, h;
  let scaleFactor = 1;

  p.setup = () => {
    const ret = fibonacciSubDiv(0, 0, p.floor(p.random(4, 12)));
    cells = ret.cells;
    w = ret.w;
    h = ret.h;

    const canvasWidth = 1000;
    scaleFactor = canvasWidth / w;

    p.createCanvas(scaleFactor * w + 2 * MARGIN, scaleFactor * h + 2 * MARGIN);
    p.noLoop();
  };

  p.draw = () => {
    p.background("#f6eee3");

    p.translate(MARGIN, MARGIN);

    for (const cell of cells) {
      cell.setScale(scaleFactor);
      if (p.random() > 0.2) {
        p.stroke(0, 0, 0, 50);
        p.noFill();
        cell.show();
      }

      p.noStroke();
      p.fill(0);
      p.fill(p.random(["#afbd22", "#6db33f", "#00958f", "#00b193", "#a0d5b5"]));

      if (p.random() > 0.9) {
        p.stroke(0, 0, 0, 50);
        p.noFill();
      }

      let flip = p.random() > 0.5;
      leaf(cell.x, cell.y, cell.w, cell.h, 16, scaleFactor, flip);
    }
  };

  p.keyPressed = () => {
    if (p.key === "s" || p.key === "S") {
      p.saveCanvas("out", "png");
    }
  };

  class Cell {
    constructor(x, y, w, h, s) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.s = 1;
    }

    show() {
      p.rect(
        this.x * this.s,
        this.y * this.s,
        this.w * this.s,
        this.h * this.s
      );
    }

    setScale(s) {
      this.s = s;
    }

    splitHL(s) {
      return {
        l: new Cell(this.x, this.y, s, this.h),
        r: new Cell(this.x + s, this.y, this.w - s, this.h),
      };
    }

    splitHR(s) {
      return {
        l: new Cell(this.x, this.y, this.w - s, this.h),
        r: new Cell(this.x + this.w - s, this.y, s, this.h),
      };
    }

    splitVT(s) {
      return {
        t: new Cell(this.x, this.y, this.w, s),
        b: new Cell(this.x, this.y + s, this.w, this.h - s),
      };
    }

    splitVB(s) {
      return {
        t: new Cell(this.x, this.y, this.w, this.h - s),
        b: new Cell(this.x, this.y + this.h - s, this.w, s),
      };
    }
  }

  function fibonacciSubDiv(x, y, n) {
    let seq = Array(n).fill(0);
    seq[1] = 1;

    for (let i = 2; i <= n; i++) {
      seq[i] = seq[i - 1] + seq[i - 2];
    }

    const w = seq[n];
    const h = seq[n - 1];

    let cells = [];
    let currCell = new Cell(x, y, seq[n], seq[n - 1]);

    let count = 0;
    for (let i = n - 1; i > 1; i--) {
      let dir = count % 4;
      count++;
      if (dir === 0) {
        let { l, r } = currCell.splitHR(seq[i]);
        cells.push(l, r);
        currCell = l;
      } else if (dir === 1) {
        let { t, b } = currCell.splitVT(seq[i]);
        cells.push(t, b);
        currCell = b;
      } else if (dir == 2) {
        let { l, r } = currCell.splitHL(seq[i]);
        cells.push(l, r);
        currCell = r;
      } else {
        let { t, b } = currCell.splitVB(seq[i]);
        cells.push(t, b);
        currCell = t;
      }
    }

    cells = cells.filter((c) => c.w === c.h);

    return { w, h, cells };
  }

  function leaf(x, y, w, h, n = 16, scaleFactor = 1, mirror = false) {
    let seq = Array(n).fill(0);
    seq[1] = 1;
    for (let i = 2; i < n; i++) {
      seq[i] = seq[i - 1] + seq[i - 2];
    }

    const cx = x + w / 2;
    const cy = y + h / 2;

    const edge = [];

    for (let i = 0; i < n; i++) {
      const sw = w / (n - 1);
      const sx = x + sw * i;
      const sh = (seq[i] / seq[n - 1]) * h;
      edge.push(p.createVector(sx, y + sh));
    }

    p.beginShape();

    function emit(px, py) {
      let ex = px;
      let ey = py;

      if (mirror) {
        ex = cx - (ex - cx);
      }

      p.vertex(ex * scaleFactor, ey * scaleFactor);
    }

    for (const p of edge) {
      emit(p.x, p.y);
    }

    for (const p of edge) {
      const mx = cx - (p.x - cx);
      const my = cy - (p.y - cy);
      emit(mx, my);
    }

    p.endShape(p.CLOSE);
  }
}

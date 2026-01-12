export default function Quine(p) {
  const M = 40, TEXT_SZ = 13, LSP = 1.1, q = String.fromCharCode(34), s = TEXT_SZ * LSP;
  let w, h, bb, ffbb, res, nr, nc, grid, palette, dl = [], c = culori, flr = p.floor, fnt;

  const SRC = [
    "export default function Quine(p) {",
    "  const M = 40; const TEXT_SZ = 13, LSP = 1.1, q = String.fromCharCode(34), s = TEXT_SZ * LSP;",
    "  let w, h, bb, ffbb, res, nr, nc, grid, palette, dl = [], c = culori, flr = p.floor, fnt;",
    "",
    "  const SRC = [",
    "  ];",
    "",
    "  p.preload = () => {fnt = p.loadFont('assets/fonts/Google_Sans_Code/static/GoogleSansCode-ExtraBold.ttf');};",
    "",
    "  p.setup = () => {",
    "    p.createCanvas(1080, 1350); p.textFont(fnt); p.textSize(TEXT_SZ); p.noLoop();",
    "    palette = c.samples(5).map(c.interpolate(['#10217c', '#81d3e4'], 'oklch')).map(c.formatHex);",
    "",
    "    w = p.width; h = p.height; bb = {l: M, r: w - M, t: M, b: h - M};",
    "    ffbb = {l: flr(-0.5 * w), r: flr(1.5 * w), t: flr(-0.5 * h), b: flr(1.5 * h)};",
    "",
    "    res = flr(w * 0.01); nr = (ffbb.b - ffbb.t) / res; nc = (ffbb.r - ffbb.l) / res;",
    "    grid = Array.from({ length: nc }, (_, i) => Array.from({ length: nr }, (_, j) =>",
    "        p.noise(0.001 * (ffbb.l + i * res), 0.001 * (ffbb.t + j * res))));",
    "",
    "    for (let i = 0; i < 200; i++) {addPath();} let ly = M + s + 18;",
    "    for (let i = 0; i < 5; i++) {addText(SRC[i], ly); ly += s;}",
    "    for (let i = 0; i < SRC.length; i++) {addText(`    ${q}${SRC[i]}${q},`, ly); ly += s;}",
    "    for (let i = 5; i < SRC.length; i++) {addText(SRC[i], ly); ly += s;}",
    "  };",
    "",
    "  p.draw = () => {p.background(255); p.beginClip(); p.rect(bb.l, bb.t, bb.r - bb.l, bb.b - bb.t);",
    "  p.endClip(); p.fill('#fffaf0'); p.rect(0, 0, w, h); dl.sort((a, b) => b.z - a.z).forEach((d) => d.show());};",
    "",
    "  p.keyPressed = () => {if (p.key.toLowerCase() === 's') {p.save('quine.png')}};",
    "",
    "  const createPath = p0 => {let c = p0, pts = [{ ...c }], dl = 0.001 * w, a;",
    "  for(let i = 0; i < 800; i++){let x = flr((c.x - ffbb.l) / res), y = flr((c.y - ffbb.t) / res);",
    "  if (x < 0 || x >= nc || y < 0 || y >= nr) break; a = grid[x][y] * p.TAU;",
    "  pts.push({...c = {x: c.x + dl * p.cos(a), y: c.y + dl * p.sin(a)}})} return pts}",
    "",
    "  const addPath = () => dl.push({z: p.random(), show: () => {",
    "  p.stroke(p.random(palette)); p.strokeWeight(16); p.strokeCap(p.PROJECT); p.noFill();",
    "  p.beginShape(); createPath({x: p.random(ffbb.l, ffbb.r), y: p.random(ffbb.t, ffbb.b)})",
    "  .forEach(pt => p.vertex(pt.x, pt.y)); p.endShape()}})",
    "",
    "  const addText = (s, y) => dl.push({z: p.random(), show: () => {p.noStroke(); p.fill('#997950'); p.text(s, M + 30, y);}});",
    "}",
  ];

  p.preload = () => {fnt = p.loadFont('assets/fonts/Google_Sans_Code/static/GoogleSansCode-ExtraBold.ttf');};

  p.setup = () => {
    p.createCanvas(1080, 1350); p.textFont(fnt); p.textSize(TEXT_SZ); p.noLoop();
    palette = c.samples(5).map(c.interpolate(['#10217c', '#81d3e4'], 'oklch')).map(c.formatHex);

    w = p.width; h = p.height; bb = {l: M, r: w - M, t: M, b: h - M};
    ffbb = {l: flr(-0.5 * w), r: flr(1.5 * w), t: flr(-0.5 * h), b: flr(1.5 * h)};

    res = flr(w * 0.01); nr = (ffbb.b - ffbb.t) / res; nc = (ffbb.r - ffbb.l) / res;
    grid = Array.from({ length: nc }, (_, i) => Array.from({ length: nr }, (_, j) =>
      p.noise(0.001 * (ffbb.l + i * res), 0.001 * (ffbb.t + j * res))));

    for (let i = 0; i < 200; i++) {addPath();} let ly = M + s + 18;
    for (let i = 0; i < 5; i++) {addText(SRC[i], ly); ly += s;}
    for (let i = 0; i < SRC.length; i++) {addText(`    ${q}${SRC[i]}${q},`, ly); ly += s;}
    for (let i = 5; i < SRC.length; i++) {addText(SRC[i], ly); ly += s;}
  };

  p.draw = () => {p.background(255); p.beginClip(); p.rect(bb.l, bb.t, bb.r - bb.l, bb.b - bb.t);
  p.endClip(); p.fill('#fffaf0'); p.rect(0, 0, w, h); dl.sort((a, b) => b.z - a.z).forEach((d) => d.show());};

  p.keyPressed = () => {if (p.key.toLowerCase() === 's') {p.save('quine.png')}};

  const createPath = p0 => {let c = p0, pts = [{ ...c }], dl = 0.001 * w, a;
  for(let i = 0; i < 800; i++){let x = flr((c.x - ffbb.l) / res), y = flr((c.y - ffbb.t) / res);
  if (x < 0 || x >= nc || y < 0 || y >= nr) break; a = grid[x][y] * p.TAU;
  pts.push({...c = {x: c.x + dl * p.cos(a), y: c.y + dl * p.sin(a)}})} return pts};

  const addPath = () => dl.push({z: p.random(), show: () => {
  p.stroke(p.random(palette)); p.strokeWeight(16); p.strokeCap(p.PROJECT); p.noFill();
  p.beginShape(); createPath({x: p.random(ffbb.l, ffbb.r), y: p.random(ffbb.t, ffbb.b)})
  .forEach(pt => p.vertex(pt.x, pt.y)); p.endShape()}});

  const addText = (s, y) => dl.push({z: p.random(), show: () => {p.noStroke(); p.fill('#997950'); p.text(s, M + 30, y);}});
}
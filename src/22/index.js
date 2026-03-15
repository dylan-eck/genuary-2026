import sketch from "./sketch.js";

let instance = new p5(sketch);

function reloadSketch() {
  if (!instance) return;
  instance.remove();
  const svgCanvas = document.querySelector(".p5Canvas");
  svgCanvas.remove();
  const seed = Math.floor(Math.random() * 1e9);
  instance = new p5((p) => sketch(p, seed));
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && e.target === document.body) {
    e.preventDefault();
    reloadSketch();
  }
});

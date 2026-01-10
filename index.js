const sketchImports = [
  () => import("./src/day01.js").then((module) => module.default),
  () => import("./src/day02.js").then((module) => module.default),
  () => import("./src/day03.js").then((module) => module.default),
  () => import("./src/day04.js").then((module) => module.default),
  () => import("./src/day05.js").then((module) => module.default),
  () => import("./src/day06.js").then((module) => module.default),
  () => import("./src/day07.js").then((module) => module.default),
  () => import("./src/day08.js").then((module) => module.default),
  () => import("./src/day09.js").then((module) => module.default),
];

let sketchIndex = 0;
let currentSketch;

async function loadSketch(index) {
  if (currentSketch) currentSketch.remove();
  try {
    const sketchModule = await sketchImports[index]();
    currentSketch = new p5(sketchModule, "sketch-container");
  } catch (error) {
    console.error(`Failed to load sketch ${index + 1}:`, error);
  }
}

currentSketch = loadSketch(0);

const nextSketchButton = document.getElementById("next-sketch-button");
const prevSketchButton = document.getElementById("prev-sketch-button");

nextSketchButton.onclick = () => {
  if (sketchIndex < sketchImports.length - 1) sketchIndex++;
  if (currentSketch) currentSketch.remove();
  currentSketch = loadSketch(sketchIndex);
};

prevSketchButton.onclick = () => {
  if (sketchIndex > 0) sketchIndex--;
  if (currentSketch) currentSketch.remove();
  currentSketch = loadSketch(sketchIndex);
};

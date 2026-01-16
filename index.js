const sketchImports = [];

const NUM_SKETCHES = 15;
for (let i = 0; i < NUM_SKETCHES; i++) {
  const day = (i + 1).toString().padStart(2, "0");
  sketchImports.push(() =>
    import(`./src/day${day}.js`).then((module) => module.default)
  );
}

let sketchIndex = 14;
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

currentSketch = loadSketch(sketchIndex);

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

import sketch from "./sketch.js";
import { run } from "../lib/run.js";

run(sketch, {
  // p5.js-svg leaves its canvas behind after remove()
  onRemove: () => document.querySelector(".p5Canvas").remove(),
});

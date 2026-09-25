export function run(sketch, { onRemove } = {}) {
  const param = new URLSearchParams(location.search).get("seed");
  let seed = /^\d+$/.test(param ?? "") ? Number(param) : randomSeed();
  let instance;

  function start() {
    history.replaceState(null, "", `?seed=${seed}`);
    instance = new p5((p) => sketch(p, seed));
  }

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && e.target === document.body) {
      e.preventDefault();
      instance.remove();
      onRemove?.();
      seed = randomSeed();
      start();
    }
  });

  start();
}

const randomSeed = () => Math.floor(Math.random() * 1e9);

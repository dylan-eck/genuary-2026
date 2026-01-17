export default function day16(p) {
  const MARGIN_PX = 80;

  const LOOP_SECONDS = 2;
  const LOOP_FRAME_RATE = 50;
  const LOOP_FRAMES = LOOP_SECONDS * LOOP_FRAME_RATE;
  const ANIMATION_SPEED = 0.05;

  let recording = false;

  p.setup = () => {
    p.createCanvas(1080, 1350);

    if (recording) {
      console.log("loop frame count: ", LOOP_FRAMES);
      p.frameRate(2);
    } else {
      p.frameRate(60);
    }
  };

  p.draw = () => {
    p.background(220);
    p.stroke(0);
    p.strokeWeight(4);
    p.noFill();

    const t = (p.frameCount % LOOP_FRAMES) / (LOOP_FRAMES - 1);

    const numPaths = 80;
    const dev = 50;
    const stepSize = 6;
    const numSteps = p.height / stepSize;
    for (let i = 0; i < numPaths; i++) {
      const path = [
        {
          x: p.map(i, 0, numPaths - 1, MARGIN_PX, p.width - MARGIN_PX),
          y: MARGIN_PX,
        },
      ];
      for (let j = 0; j < numSteps; j++) {
        const pt = path.at(-1);

        const dx = p.lerp(
          0,
          p.map(
            p.noise(
              p.map(p.cos(t * p.TAU) - i * 10, -1, 1, 0, ANIMATION_SPEED),
              p.map(p.sin(t * p.TAU) - i * 10, -1, 1, 0, ANIMATION_SPEED),
              0.05 * (pt.y + i * 200)
            ),
            0,
            1,
            -dev / 2,
            dev / 2
          ),
          easeInExpo(pt.y / p.height)
        );

        path.push({
          x: pt.x + dx,
          y: pt.y + stepSize,
        });
      }

      p.beginShape();
      path.map((pt) => p.vertex(pt.x, pt.y));
      p.endShape();
    }

    if (recording && p.frameCount <= LOOP_FRAMES) {
      const frameNum = `${p.frameCount}`.padStart(4, "0");
      p.save(`${frameNum}.png`);
    } else if (recording) {
      p.noLoop();
    }
  };

  function easeInExpo(x) {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
  }
}

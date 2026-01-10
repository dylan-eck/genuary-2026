export default function day07(p) {
  let raymarchShader;

  let colorA;
  let colorB;

  const NUM_BOXES = 10;
  let boxes = [];

  const LOOP_TIME = 6.0;

  let recorder;
  let chunks = [];
  let frame = 0;
  let started = false;
  const FRAME_RECORD_COUNT = 60 * 6;

  p.preload = function () {
    raymarchShader = p.loadShader(
      "./src/shaders/raymarch.vert.glsl",
      "./src/shaders/raymarch.frag.glsl"
    );
  };

  p.setup = function () {
    p.createCanvas(1080, 1920, p.WEBGL);
    p.blendMode(p.BLEND);
    p.frameRate(60);

    colorA = {
      mode: "oklch",
      l: 0.4,
      c: 0.1,
      h: p.random(360),
    };

    const hueShift = 180;
    colorB = {
      ...colorA,
      l: colorA.l + 0.2,
      h: (((colorA.h + hueShift) % 360) + 360) % 360,
    };

    p.shader(raymarchShader);

    for (let i = 0; i < NUM_BOXES; i++) {
      const r = p.random() * 0.6;
      const theta = p.random(p.TWO_PI);
      const w = p.random(0.1, 0.3);
      const h = p.random(0.5, 1.5);

      const box = {
        pos: [r * p.cos(theta), 0, r * p.sin(theta)],
        size: [w, h, w],
        phase: p.random(p.TWO_PI),
      };

      boxes.push(box);
    }

    const stream = p.canvas.captureStream(60);

    recorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
      videoBitsPerSecond: 8_000_000,
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "day07.webm";
      a.click();

      URL.revokeObjectURL(url);
    };
  };

  p.draw = function () {
    let t = (frame / FRAME_RECORD_COUNT) * LOOP_TIME;
    let loopPhase = (p.TWO_PI * t) / LOOP_TIME;

    for (const box of boxes) {
      box.pos[1] = 0.5 * p.sin(loopPhase + box.phase);
      box.size[1] = Math.abs(p.sin(loopPhase + box.phase)) + 0.2;
    }

    raymarchShader.setUniform("uResolution", [p.width, p.height]);
    raymarchShader.setUniform(
      "uBoxPositions",
      boxes.flatMap((b) => b.pos)
    );
    raymarchShader.setUniform(
      "uBoxSizes",
      boxes.flatMap((b) => b.size)
    );
    raymarchShader.setUniform("uColorA", [colorA.l, colorA.c, colorA.h]);
    raymarchShader.setUniform("uColorB", [colorB.l, colorB.c, colorB.h]);

    drawBackgroundGradient(
      p.color(culori.formatHex(colorA)),
      p.color(culori.formatHex(colorB))
    );

    p.noStroke();
    p.plane(p.width, p.height);

    if (!started) {
      recorder.start();
      started = true;
    }

    frame++;

    if (frame > FRAME_RECORD_COUNT) {
      recorder.stop();
      p.noLoop();
    }
  };

  function drawBackgroundGradient(topColor, bottomColor) {
    for (let y = -p.height / 2; y < p.height; y++) {
      let inter = p.map(y, 0, p.height, 0, 1);
      let c = p.lerpColor(topColor, bottomColor, inter);
      p.stroke(c);
      p.line(-p.width / 2, y, p.width, y);
    }
  }
}

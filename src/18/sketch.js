export default function sketch(p, seed) {
  const NUM_DIRS = 5;
  const MARGIN_PX = 50;
  const POINTS_PER_SEGMENT = 20;
  const POINT_DEV = 0.3;
  const RECORD_SECONDS = 240;
  const RECORD_FRAME_RATE = 60;
  const RECORD_FRAME_COUNT = RECORD_SECONDS * RECORD_FRAME_RATE;

  let recording = false;

  let positions = [];
  let segmentOffsets = [];

  let targetX = 0;
  let targetY = 0;
  let step = 100;
  let lastT = 0;
  let dispX;
  let dispY;
  let prevPhi = 0;
  let targetPhi = 0;

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function lerpAngle(from, to, t) {
    let diff = to - from;
    diff = mod(diff + p.PI, p.TAU) - p.PI;
    return from + diff * t;
  }

  function createOffsets(prevLastOffset) {
    const offsets = [];
    offsets.push(
      prevLastOffset
        ? { dx: prevLastOffset.dx, dy: prevLastOffset.dy }
        : {
            dx: p.randomGaussian(0, POINT_DEV),
            dy: p.randomGaussian(0, POINT_DEV),
          },
    );
    for (let j = 1; j < POINTS_PER_SEGMENT; j++) {
      offsets.push({
        dx: p.randomGaussian(0, POINT_DEV),
        dy: p.randomGaussian(0, POINT_DEV),
      });
    }
    return offsets;
  }

  p.setup = () => {
    p.randomSeed(seed);
    p.noiseSeed(seed);
    p.createCanvas(1080, 1920);

    if (recording) {
      p.frameRate(10);
    }

    positions.push({ x: targetX, y: targetY });

    const dir = (p.floor(p.random() * NUM_DIRS) / NUM_DIRS) * p.TAU;

    targetX += step * p.cos(dir);
    targetY += step * p.sin(dir);
    positions.push({ x: targetX, y: targetY });

    segmentOffsets.push(createOffsets(null));

    const initDx = targetX - positions[0].x;
    const initDy = targetY - positions[0].y;
    const initTheta = p.atan2(initDy, initDx);
    targetPhi = -p.PI / 2 - initTheta;
    prevPhi = targetPhi;

    // p.background(255);
    // p.beginClip();
    // p.rect(
    //   MARGIN_PX,
    //   MARGIN_PX,
    //   p.width - 2 * MARGIN_PX,
    //   p.height - 2 * MARGIN_PX,
    // );
    // p.endClip();
  };

  p.draw = () => {
    const t = (p.frameCount % 60) / 59;
    if (t < lastT) {
      prevPhi = targetPhi;
      const dir = (p.floor(p.random() * NUM_DIRS) / NUM_DIRS) * p.TAU;
      targetX += step * p.cos(dir);
      targetY += step * p.sin(dir);
      positions.push({ x: targetX, y: targetY });
      const prevOffsets = segmentOffsets.at(-1);
      segmentOffsets.push(createOffsets(prevOffsets.at(-1)));
    }
    lastT = t;

    const lastPos = positions.at(-2);
    dispX = p.lerp(lastPos.x, targetX, t);
    dispY = p.lerp(lastPos.y, targetY, t);

    const dx = targetX - lastPos.x;
    const dy = targetY - lastPos.y;
    const theta = p.atan2(dy, dx);
    targetPhi = -p.PI / 2 - theta;

    const phi = lerpAngle(prevPhi, targetPhi, p.constrain(2 * t, 0, 1));

    p.background("#FCF5E5");
    p.push();

    p.translate(p.width / 2, p.height / 2);
    p.rotate(phi);
    p.translate(-dispX, -dispY);

    p.stroke("#41424C");
    p.strokeWeight(5);

    const numSegments = positions.length - 1;
    for (let seg = 0; seg < numSegments; seg++) {
      const isCurrent = seg === numSegments - 1;
      const start = positions[seg];
      const end = positions[seg + 1];
      const offsets = segmentOffsets[seg];

      const points = [];
      for (let j = 0; j < POINTS_PER_SEGMENT; j++) {
        const frac = j / (POINTS_PER_SEGMENT - 1);
        const x = p.lerp(start.x, end.x, frac) + offsets[j].dx;
        const y = p.lerp(start.y, end.y, frac) + offsets[j].dy;
        points.push({ x, y });
      }

      if (!isCurrent) {
        for (let j = 1; j < POINTS_PER_SEGMENT; j++) {
          p.line(points[j - 1].x, points[j - 1].y, points[j].x, points[j].y);
        }
      } else {
        const maxFrac = t;
        const stepFrac = 1 / (POINTS_PER_SEGMENT - 1);
        const lastJ = Math.floor(maxFrac / stepFrac);
        for (let j = 1; j <= lastJ; j++) {
          p.line(points[j - 1].x, points[j - 1].y, points[j].x, points[j].y);
        }
        if (lastJ < POINTS_PER_SEGMENT - 1 && t > 0) {
          const fracAtLast = lastJ * stepFrac;
          const nextFrac = (lastJ + 1) * stepFrac;
          const localT = (maxFrac - fracAtLast) / (nextFrac - fracAtLast);
          const interpX = p.lerp(points[lastJ].x, points[lastJ + 1].x, localT);
          const interpY = p.lerp(points[lastJ].y, points[lastJ + 1].y, localT);
          p.line(points[lastJ].x, points[lastJ].y, interpX, interpY);
        }
      }
    }

    p.pop();

    if (recording) {
      if (p.frameCount <= RECORD_FRAME_COUNT) {
        const frameNum = `${p.frameCount}`.padStart(4, "0");
        p.save(`${frameNum}.png`);
      } else {
        p.noLoop();
      }
    }
  };
}

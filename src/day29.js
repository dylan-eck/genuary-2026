export default function day29(p) {
  const RECORD_FRAME_COUNT = 60 * 60;

  class Boid {
    constructor(x, y, dna = null) {
      this.p = p;

      this.position = p.createVector(x, y);
      this.velocity = p.createVector(0, 0);
      this.acceleration = p.createVector(0, 0);

      this.maxSpeed = 5;
      this.maxForce = 0.5;

      this.r = 20;

      if (dna === null) {
        this.dna = [];
        this.dna[0] = p.random(-2, 2);
        this.dna[1] = p.random(-2, 2);
        this.dna[2] = p.random(0, 150);
        this.dna[3] = p.random(0, 150);
      } else {
        this.dna = dna;
      }

      this.health = 1;
    }

    update() {
      this.health -= 0.003;
      this.health = p.min(1, this.health);

      this.velocity.add(this.acceleration);
      this.velocity.limit(this.maxSpeed);
      this.position.add(this.velocity);

      this.acceleration.set(0, 0);
    }

    show() {
      const p = this.p;

      p.push();
      p.translate(this.position.x, this.position.y);
      p.rotate(this.velocity.heading() - p.HALF_PI);

      p.noStroke();
      p.fill(p.lerpColor(p.color("#3E3E42"), p.color("#81819C"), this.health));
      p.triangle(0, this.r, -this.r / 2, -this.r, this.r / 2, -this.r);

      p.pop();
    }

    isDead() {
      return this.health < 0;
    }

    applyForce(force) {
      this.acceleration.add(force);
    }

    seek(target) {
      const p = this.p;

      const desired = p5.Vector.sub(target, this.position);
      const d = desired.mag();

      let speed = this.maxSpeed;

      const slowRadius = 50;

      if (d < slowRadius) {
        speed = p.map(d, 0, slowRadius, 0, this.maxSpeed);
      }

      desired.setMag(speed);

      const steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxForce);

      return steer;
    }

    boundaries() {
      const p = this.p;
      const offset = 50;
      let desired = null;

      if (this.position.x < offset) {
        desired = p.createVector(this.maxSpeed, this.velocity.y);
      } else if (this.position.x > p.width - offset) {
        desired = p.createVector(-this.maxSpeed, this.velocity.y);
      }

      if (this.position.y < offset) {
        desired = p.createVector(this.velocity.x, this.maxSpeed);
      } else if (this.position.y > p.height - offset) {
        desired = p.createVector(this.velocity.x, -this.maxSpeed);
      }

      if (desired !== null) {
        desired.normalize().mult(this.maxSpeed);
        const steer = p5.Vector.sub(desired, this.velocity).limit(
          this.maxForce,
        );
        this.applyForce(steer);
      }
    }

    act(foods, poisons) {
      const foodSteer = this.eat(foods, 0.3, this.dna[2]).mult(this.dna[0]);
      const poisonSteer = this.eat(poisons, -0.2, this.dna[3]).mult(
        this.dna[1],
      );

      if (foodSteer.equals(0, 0) && poisonSteer.equals(0, 0)) {
        const wanderForce = this.wander();
        this.applyForce(wanderForce);
      } else {
        this.applyForce(p5.Vector.add(foodSteer, poisonSteer));
      }
    }

    eat(foods, nutrition, perception) {
      const p = this.p;

      if (!foods.length) return p.createVector(0, 0);

      let closest = null;
      let minDist = Infinity;

      for (let i = foods.length - 1; i >= 0; i--) {
        const d = this.position.dist(foods[i]);

        if (d < this.maxSpeed) {
          this.health += nutrition;
          foods.splice(i, 1);
          continue;
        }

        if (d < perception && d < minDist) {
          minDist = d;
          closest = foods[i];
        }
      }

      return closest ? this.seek(closest) : p.createVector(0, 0);
    }

    wander() {
      const p = this.p;

      const theta = p.random(p.TWO_PI);
      const force = p5.Vector.fromAngle(theta);
      force.setMag(0.2);
      return force;
    }

    clone() {
      const p = this.p;

      if (p.random() < this.health * 0.005) {
        const newDna = this.dna.map((g, i) => {
          if (p.random() < 0.2) {
            g += p.randomGaussian(0, 0.1);
          }

          if (i === 2 || i === 3) {
            g = p.constrain(g, 0, 200);
          }

          return g;
        });

        return new Boid(this.position.x, this.position.y, newDna);
      }
      return null;
    }
  }

  let boids = [];
  let foods = [];
  let poisons = [];

  p.setup = () => {
    p.createCanvas(1080, 1920);
    p.frameRate(20);

    boids = Array.from(
      { length: 10 },
      () => new Boid(p.random(p.width), p.random(p.height)),
    );

    foods = Array.from({ length: 100 }, () =>
      p.createVector(p.random(p.width), p.random(p.height)),
    );

    poisons = Array.from({ length: 100 }, () =>
      p.createVector(p.random(p.width), p.random(p.height)),
    );
  };

  p.draw = () => {
    p.background(0);

    if (p.random() < 0.3) {
      foods.push(p.createVector(p.random(p.width), p.random(p.height)));
    }

    if (p.random() < 0.01) {
      poisons.push(p.createVector(p.random(p.width), p.random(p.height)));
    }

    p.noStroke();
    p.fill("#2E9926");
    foods.forEach((v) => {
      p.beginShape();
      const r = 4 + p.noise(v.x + v.y) * 4;
      const n = 16;
      for (let i = 0; i < n; i++) {
        const theta = p.lerp(0, p.TAU, i / n);
        const x = v.x + r * p.cos(theta);
        const y = v.y + r * p.sin(theta);
        p.vertex(x, y);
      }

      p.endShape();
    });

    p.noStroke();
    p.fill("#990E0E");
    poisons.forEach((v) => {
      const r = 6 + p.noise(v.x + v.y) * 4;
      p.push();
      p.translate(v.x, v.y);
      p.rotate(p.noise(v.x + v.y) * p.TAU);
      p.triangle(0, r, -r, -r, r, -r);
      p.pop();
    });

    for (let i = boids.length - 1; i >= 0; i--) {
      const b = boids[i];

      b.act(foods, poisons);
      b.boundaries();
      b.update();

      if (b.isDead()) {
        boids.splice(i, 1);
        foods.push(b.position.copy());
      }

      b.show();

      const baby = b.clone();
      if (baby) boids.push(baby);
    }

    if (p.frameCount <= RECORD_FRAME_COUNT) {
      const frameNum = `${p.frameCount}`.padStart(4, "0");
      p.save(`${frameNum}.png`);
    } else {
      p.noLoop();
    }
  };
}

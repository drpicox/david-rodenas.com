import { describe, expect, it } from "vitest";
import type { Body } from "./Body";
import { tangleStep } from "./tangleStep";

const at = (x: number, y: number): Body => ({ x, y, vx: 0, vy: 0 });
const distance = (a: Body, b: Body) => Math.hypot(a.x - b.x, a.y - b.y);
const run = (bodies: Body[], links: [number, number][], steps = 200) => {
  for (let step = 0; step < steps; step += 1) tangleStep(bodies, links, { width: 600, height: 400 });
  return bodies;
};

describe("the tangle: files with no boxes, only the pull of what they need", () => {
  it("pushes two files that need nothing of each other apart", () => {
    const [a, b] = run([at(300, 200), at(302, 200)], []);
    expect(distance(a!, b!)).toBeGreaterThan(40);
  });

  it("pulls two files that need each other close", () => {
    const [a, b] = run([at(100, 200), at(500, 200)], [[0, 1]]);
    expect(distance(a!, b!)).toBeLessThan(120);
  });

  it("keeps everything in the picture", () => {
    for (const body of run([at(0, 0), at(600, 400), at(-50, 900)], [])) {
      expect(body.x).toBeGreaterThanOrEqual(0);
      expect(body.x).toBeLessThanOrEqual(600);
      expect(body.y).toBeGreaterThanOrEqual(0);
      expect(body.y).toBeLessThanOrEqual(400);
    }
  });

  it("comes to rest instead of shaking for ever", () => {
    const bodies = run([at(100, 100), at(200, 120), at(150, 300)], [[0, 1], [1, 2]], 600);
    expect(Math.max(...bodies.map((body) => Math.hypot(body.vx, body.vy)))).toBeLessThan(0.05);
  });
});

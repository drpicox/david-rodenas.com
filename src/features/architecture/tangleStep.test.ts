import { describe, expect, it } from "vitest";
import { randomOf } from "../../platform/random/randomOf";
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

  it("comes to rest even round a file that many others need, the way the files at the heart of a code base are", () => {
    // One file in the middle, and a hundred that need it, all around it: the shape of el.ts, or escapeHtml.ts.
    const bodies = [at(300, 200), ...Array.from({ length: 100 }, (_, index) => at(300 + 250 * Math.cos(index), 200 + 180 * Math.sin(index)))];
    const links = bodies.slice(1).map((_, index) => [index + 1, 0] as [number, number]);
    run(bodies, links, 1200);
    expect(Math.max(...bodies.map((body) => Math.hypot(body.vx, body.vy)))).toBeLessThan(0.5);
  });

  // As crowded as this site's — its files to the area of the picture — in half the picture, so it runs quickly wherever the tests do.
  it("settles a code base as crowded as this site's, cooling as the scene cools it, and never flings a file across the picture", { timeout: 20_000 }, () => {
    const random = randomOf(7);
    const bodies = Array.from({ length: 320 }, () => at(390 + (random() - 0.5) * 60, 270 + (random() - 0.5) * 60));
    const links = Array.from({ length: 660 }, () => [Math.floor(random() ** 3 * 320), Math.floor(random() * 320)] as [number, number]);
    let fastest = 0;
    for (let step = 0; step < 900; step += 1) {
      tangleStep(bodies, links, { width: 780, height: 540, heat: Math.exp(-step / 150) });
      fastest = Math.max(fastest, ...bodies.map((body) => Math.hypot(body.vx, body.vy)));
    }
    expect(fastest).toBeLessThanOrEqual(12 + 1e-9);
    // At rest, not crawling: a twentieth of a pixel a step is nothing to see.
    expect(Math.max(...bodies.map((body) => Math.hypot(body.vx, body.vy)))).toBeLessThan(0.05);
  });

  it("comes to rest instead of shaking for ever", () => {
    const bodies = run([at(100, 100), at(200, 120), at(150, 300)], [[0, 1], [1, 2]], 600);
    expect(Math.max(...bodies.map((body) => Math.hypot(body.vx, body.vy)))).toBeLessThan(0.05);
  });
});

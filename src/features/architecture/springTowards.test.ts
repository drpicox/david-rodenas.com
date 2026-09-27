import { describe, expect, it } from "vitest";
import type { Body } from "./Body";
import { springTowards } from "./springTowards";

describe("a ball flying to its place", () => {
  it("gets there, and stays", () => {
    const body: Body = { x: 0, y: 0, vx: 0, vy: 0 };
    for (let frame = 0; frame < 240; frame += 1) springTowards(body, 100, 50, 1 / 60);
    expect(body.x).toBeCloseTo(100, 0);
    expect(body.y).toBeCloseTo(50, 0);
    expect(Math.hypot(body.vx, body.vy)).toBeLessThan(0.5);
  });

  it("overshoots a little on the way, which is what makes it look thrown and not slid", () => {
    const body: Body = { x: 0, y: 0, vx: 0, vy: 0 };
    let furthest = 0;
    for (let frame = 0; frame < 240; frame += 1) {
      springTowards(body, 100, 0, 1 / 60);
      furthest = Math.max(furthest, body.x);
    }
    expect(furthest).toBeGreaterThan(100.5);
    expect(furthest).toBeLessThan(115);
  });
});

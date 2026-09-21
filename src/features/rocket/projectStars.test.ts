import { describe, expect, it } from "vitest";
import { projectStars } from "./projectStars";

const north = { name: "N", ra: 0, dec: 90, lightYears: 10 };
const east = { name: "E", ra: 6, dec: 0, lightYears: 10 };
const front = { name: "F", ra: 0, dec: 0, lightYears: 5 };
const view = { yaw: 0, pitch: 0, radius: 100, reach: 10 };

describe("the near stars, seen from outside", () => {
  it("puts a star as far from the Sun on the picture as it is in space, when it lies across the view", () => {
    const [n, e] = projectStars([north, east], view);
    expect(n?.y).toBeCloseTo(-100);
    expect(n?.x).toBeCloseTo(0);
    expect(Math.abs(e?.x ?? 0)).toBeCloseTo(100);
  });

  it("turns with the view: half a turn puts what was on one side on the other", () => {
    const [before] = projectStars([east], view);
    const [after] = projectStars([east], { ...view, yaw: Math.PI });
    expect(after?.x).toBeCloseTo(-(before?.x ?? 0));
  });

  it("says how near the eye each star is, so the near ones can be drawn over the far ones and larger", () => {
    const [f] = projectStars([front], view);
    const [behind] = projectStars([front], { ...view, yaw: Math.PI });
    expect(f?.depth).toBeGreaterThan(behind?.depth ?? 0);
  });

  it("tilts: looking from above brings the north star to the middle", () => {
    const [n] = projectStars([north], { ...view, pitch: Math.PI / 2 });
    expect(n?.y).toBeCloseTo(0);
  });
});

import { describe, expect, it } from "vitest";
import { cascadeFrom } from "./cascadeFrom";

describe("the cascade, counted from where each file stood", () => {
  const standings = [
    { at: 1, id: 0, distance: 1, changed: true },
    { at: 1, id: 1, distance: null, changed: false },
    { at: 2, id: 0, distance: 1, changed: false },
    { at: 3, id: 0, distance: 2, changed: false },
  ];

  it("counts, at each distance, the files seen and the ones that changed, the nearest first and nothing changed below last", () => {
    expect(cascadeFrom(standings)).toEqual([
      { distance: 1, seen: 2, changed: 1 },
      { distance: 2, seen: 1, changed: 0 },
      { distance: null, seen: 1, changed: 0 },
    ]);
  });

  it("can stop at a commit", () => {
    expect(cascadeFrom(standings, 1)).toEqual([
      { distance: 1, seen: 1, changed: 1 },
      { distance: null, seen: 1, changed: 0 },
    ]);
  });
});

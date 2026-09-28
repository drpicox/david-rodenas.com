import { describe, expect, it } from "vitest";
import { groundOf } from "./groundOf";

// A file changed with something one arrow below it one time in five, two arrows below one time in twenty, and one time in a hundred with nothing changed below.
const cascade = [
  { distance: 1, seen: 100, changed: 20 },
  { distance: 2, seen: 100, changed: 5 },
  { distance: null, seen: 100, changed: 1 },
];

describe("what each file's ground predicted, beside what it did", () => {
  const ground = groundOf(
    [
      { at: 1, id: 7, distance: 1, changed: true },
      { at: 2, id: 7, distance: 2, changed: false },
      { at: 3, id: 7, distance: null, changed: false },
      { at: 1, id: 8, distance: null, changed: true },
    ],
    cascade,
  );

  it("adds up, for every commit, how much more likely than anywhere a file was to change at its distance from the nearest change below it", () => {
    expect(ground.get(7)?.expected).toBeCloseTo(0.19 + 0.04);
    expect(ground.get(8)?.expected).toBe(0);
  });

  it("counts beside it the changes the file had", () => {
    expect(ground.get(7)?.actual).toBe(1);
    expect(ground.get(8)?.actual).toBe(1);
  });

  it("can count only up to a commit", () => {
    expect(groundOf([{ at: 1, id: 7, distance: 1, changed: true }, { at: 5, id: 7, distance: 1, changed: true }], cascade, 3).get(7)).toEqual({ expected: 0.19, actual: 1 });
  });
});

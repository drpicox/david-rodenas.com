import { describe, expect, it } from "vitest";
import { groundOf } from "./groundOf";

// A file changed with something one arrow below it one time in five, two arrows below one time in twenty, and one time in a hundred with nothing changed below.
const cascade = [
  { distance: 1, seen: 100, changed: 20 },
  { distance: 2, seen: 100, changed: 5 },
  { distance: null, seen: 100, changed: 1 },
];

describe("what each file's ground would lead one to expect, beside what it did", () => {
  const ground = groundOf(
    [
      { at: 1, id: 7, distance: 1, changed: true },
      { at: 2, id: 7, distance: 2, changed: false },
      { at: 3, id: 7, distance: null, changed: false },
      { at: 1, id: 8, distance: null, changed: true },
    ],
    cascade,
  );

  it("adds up, for every commit, the share of files that changed at the distance it stood from the nearest change below it — nothing below counted too, at its own share", () => {
    expect(ground.get(7)?.expected).toBeCloseTo(0.2 + 0.05 + 0.01);
    expect(ground.get(8)?.expected).toBeCloseTo(0.01);
  });

  it("counts beside it the changes the file had, so that a file that changed as the history's rates say stands on the line", () => {
    expect(ground.get(7)?.actual).toBe(1);
    expect(ground.get(8)?.actual).toBe(1);
  });

  it("counts three arrows away and further as one distance, its share taken from all of them together: so far, few changes travel there", () => {
    const far = [{ distance: 3, seen: 50, changed: 1 }, { distance: 4, seen: 50, changed: 3 }, { distance: null, seen: 100, changed: 1 }];
    expect(groundOf([{ at: 1, id: 7, distance: 4, changed: false }], far).get(7)?.expected).toBeCloseTo(0.04);
  });

  it("can count only up to a commit", () => {
    expect(groundOf([{ at: 1, id: 7, distance: 1, changed: true }, { at: 5, id: 7, distance: 1, changed: true }], cascade, 3).get(7)).toEqual({ expected: 0.2, actual: 1 });
  });
});

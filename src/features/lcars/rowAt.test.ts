import { describe, expect, it } from "vitest";
import { rowAt } from "./rowAt";
import { SCHEMATIC } from "./SCHEMATIC";

const rows = [
  { top: 0, height: 47 },
  { top: 47 + SCHEMATIC.between, height: 71 },
];
const second = rows[1]!.top;

describe("the row of a schematic a level is on", () => {
  it("is the one that level is in, and the nearer of two for a level in the gap between them", () => {
    expect([0, 20, 47].map((y) => rowAt(rows, y))).toEqual([0, 0, 0]);
    expect([second, second + 70].map((y) => rowAt(rows, y))).toEqual([1, 1]);
    expect([47 + SCHEMATIC.between / 2 - 1, 47 + SCHEMATIC.between / 2].map((y) => rowAt(rows, y))).toEqual([0, 1]);
  });

  it("is one before the first for a level over it, and one past the last for a level under it", () => {
    expect(rowAt(rows, -SCHEMATIC.between / 2 - 1)).toBe(-1);
    expect(rowAt(rows, -1)).toBe(0);
    expect(rowAt(rows, second + 71 + SCHEMATIC.between / 2)).toBe(2);
  });

  it("is the first where there are none", () => {
    expect(rowAt([], 30)).toBe(0);
  });
});

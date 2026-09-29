import { describe, expect, it } from "vitest";
import { pointedArrowsOf } from "./pointedArrowsOf";

// 1 needs 2, 2 needs 3, 4 needs 1; and 5 needs 3, which pointing at 1 did not find that way.
const LINKS: [number, number][] = [[1, 2], [2, 3], [4, 1], [5, 3]];

describe("the arrows pointing at a file brings out", () => {
  it("are those of what it needs and of what needs it, one step further out each time, and only along the way each was found", () => {
    expect(pointedArrowsOf(LINKS, 1, new Map([[2, 1], [3, 2]]), new Map([[4, 1]]))).toEqual([
      { from: 1, to: 2, kind: "needs", distance: 1 },
      { from: 2, to: 3, kind: "needs", distance: 2 },
      { from: 4, to: 1, kind: "neededBy", distance: 1 },
    ]);
  });

  it("are none, for a file that needs nothing and that nothing needs", () => {
    expect(pointedArrowsOf(LINKS, 9, new Map(), new Map())).toEqual([]);
  });
});

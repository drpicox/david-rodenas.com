import { describe, expect, it } from "vitest";
import { pointedAt } from "./pointedAt";

// 1 needs 2, 2 needs 3, 4 needs 1.
const LINKS: [number, number][] = [[1, 2], [2, 3], [4, 1]];
const THREADS = [
  { a: 1, b: 3, together: 2, joined: "through" as const },
  { a: 1, b: 5, together: 4, joined: "none" as const },
  { a: 3, b: 5, together: 2, joined: "none" as const },
];
const GROUPS = new Map([[1, 0], [2, 0], [3, 1], [4, 0], [5, 1]]);

describe("what pointing at a file brings out", () => {
  it("its arrows, as far as asked: what it needs and what needs it, each at its distance", () => {
    const one = pointedAt(1, "1", LINKS, GROUPS, THREADS);
    expect(one.needs).toEqual(new Map([[2, 1]]));
    expect(one.neededBy).toEqual(new Map([[4, 1]]));
    expect(one.tied).toEqual(new Set([1, 2, 4]));
    expect(pointedAt(1, "all", LINKS, GROUPS, THREADS).needs).toEqual(new Map([[2, 1], [3, 2]]));
  });

  it("its group: every file the arrows gather with it", () => {
    const group = pointedAt(1, "group", LINKS, GROUPS, THREADS);
    expect(group.tied).toEqual(new Set([1, 2, 4]));
    expect(group.needs.size).toBe(0);
  });

  it("what changed with it, the most often first", () => {
    const together = pointedAt(1, "together", LINKS, GROUPS, THREADS);
    expect(together.partners).toEqual([[5, 4], [3, 2]]);
    expect(together.tied).toEqual(new Set([1, 5, 3]));
  });
});

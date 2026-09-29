import { describe, expect, it } from "vitest";
import { pointedAt } from "./pointedAt";
import { pointedSaid } from "./pointedSaid";

// 1 needs 2, 2 needs 3, 4 needs 1; 1 changed with 5 four times and with 3 twice.
const LINKS: [number, number][] = [[1, 2], [2, 3], [4, 1]];
const THREADS = [
  { a: 1, b: 3, together: 2, joined: "through" as const },
  { a: 1, b: 5, together: 4, joined: "none" as const },
];
const GROUPS = new Map([[1, 0], [2, 0], [3, 1], [4, 0], [5, 1]]);
const PATHS = new Map([[1, "platform/a/one.ts"], [2, "platform/a/two.ts"], [3, "platform/b/three.ts"], [4, "features/c/four.ts"], [5, "features/c/five.ts"]]);

describe("what pointing at a file brought out, in words beside the picture", () => {
  it("names the file, and counts its arrows as far as asked, each kind keyed to its colour", () => {
    const said = pointedSaid("platform/a/one.ts", "1", pointedAt(1, "1", LINKS, GROUPS, THREADS), PATHS);
    expect(said).toContain("<code>platform/a/one.ts</code>");
    expect(said).toContain('<span class="key needs"></span>needs 1');
    expect(said).toContain('<span class="key needed-by"></span>needed by 1');
    expect(pointedSaid("platform/a/one.ts", "all", pointedAt(1, "all", LINKS, GROUPS, THREADS), PATHS)).toContain("needs 1 (2 within any)");
  });

  it("says its group, and the boxes in it", () => {
    expect(pointedSaid("platform/a/one.ts", "group", pointedAt(1, "group", LINKS, GROUPS, THREADS), PATHS)).toContain("its group: 3 files in 2 boxes: a 2, c 1");
  });

  it("says what changed with it, the most often first", () => {
    expect(pointedSaid("platform/a/one.ts", "together", pointedAt(1, "together", LINKS, GROUPS, THREADS), PATHS)).toContain("changed with five.ts 4×, three.ts 2×");
    expect(pointedSaid("platform/a/two.ts", "together", pointedAt(2, "together", LINKS, GROUPS, THREADS), PATHS)).toContain("changed with no file twice");
  });

  it("says how much of it the tests run, where that was counted", () => {
    expect(pointedSaid("platform/a/one.ts", "1", pointedAt(1, "1", LINKS, GROUPS, THREADS), PATHS, 85.2)).toContain("tests run 85% of it");
  });
});

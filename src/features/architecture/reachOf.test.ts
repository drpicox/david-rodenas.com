import { describe, expect, it } from "vitest";
import { reachOf } from "./reachOf";

// 1 needs 2, 2 needs 3, 3 needs 4; and 5 needs 1.
const LINKS: [number, number][] = [[1, 2], [2, 3], [3, 4], [5, 1]];

describe("how far a file reaches, what it needs and what needs it", () => {
  it("finds what a file needs, as far as asked, each at the distance it is", () => {
    expect(reachOf(LINKS, 1, 1, "needs")).toEqual(new Map([[2, 1]]));
    expect(reachOf(LINKS, 1, 2, "needs")).toEqual(new Map([[2, 1], [3, 2]]));
    expect(reachOf(LINKS, 1, Infinity, "needs")).toEqual(new Map([[2, 1], [3, 2], [4, 3]]));
  });

  it("finds what needs a file the same way, going against the arrows", () => {
    expect(reachOf(LINKS, 3, 1, "neededBy")).toEqual(new Map([[2, 1]]));
    expect(reachOf(LINKS, 3, Infinity, "neededBy")).toEqual(new Map([[2, 1], [1, 2], [5, 3]]));
  });

  it("counts each file once, at the shortest way to it, and never the file itself", () => {
    expect(reachOf([[1, 2], [2, 1], [1, 3], [3, 2]], 1, Infinity, "needs")).toEqual(new Map([[2, 1], [3, 1]]));
  });
});

import { describe, expect, it } from "vitest";
import { heightsOf } from "./heightsOf";
import type { Snapshot } from "./Snapshot";

const snapshot = (ids: number[], links: [number, number][]): Snapshot => ({
  modules: ids.map((id) => ({ id, path: `${id}.ts`, lines: 1, test: false })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});

describe("how tall the stack under each file is", () => {
  it("counts the arrows of the longest chain of what a file needs, down to a file that needs nothing", () => {
    // 0 needs 1 and 3; 1 needs 2; 2 and 3 need nothing.
    expect(heightsOf(snapshot([0, 1, 2, 3], [[0, 1], [1, 2], [0, 3]]))).toEqual(new Map([[0, 2], [1, 1], [2, 0], [3, 0]]));
  });

  it("stands files that need each other round in a circle at one height, the circle counted once", () => {
    // 0 needs 1, 1 and 2 need each other, 2 needs 3.
    const heights = heightsOf(snapshot([0, 1, 2, 3], [[0, 1], [1, 2], [2, 1], [2, 3]]));
    expect([heights.get(1), heights.get(2), heights.get(0)]).toEqual([1, 1, 2]);
  });
});

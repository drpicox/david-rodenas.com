import { describe, expect, it } from "vitest";
import { coresOf } from "./coresOf";
import type { Snapshot } from "./Snapshot";

const snapshot = (ids: number[], links: [number, number][]): Snapshot => ({
  modules: ids.map((id) => ({ id, path: `${id}.ts`, lines: 1, test: false })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});

describe("how deep in the knot each file sits", () => {
  it("is the largest k for which the file stays when every file with fewer than k neighbours is taken away, again and again", () => {
    // A square with both diagonals, 0-1-2-3, each with three neighbours; 4 hangs off 0, and 5 off 4.
    const cores = coresOf(snapshot([0, 1, 2, 3, 4, 5], [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3], [4, 0], [5, 4]]));
    expect([0, 1, 2, 3, 4, 5].map((id) => cores.get(id))).toEqual([3, 3, 3, 3, 1, 1]);
  });
});

import { describe, expect, it } from "vitest";
import { assortativityOf } from "./assortativityOf";
import type { Snapshot } from "./Snapshot";

const snapshot = (ids: number[], links: [number, number][]): Snapshot => ({
  modules: ids.map((id) => ({ id, path: `${id}.ts`, lines: 1, test: false })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});

describe("whether files with many neighbours are joined to files with many, or with few", () => {
  it("is -1 for a star, where the one file with many is joined only to files with one", () => {
    expect(assortativityOf(snapshot([0, 1, 2, 3], [[1, 0], [2, 0], [3, 0]]))).toBeCloseTo(-1);
  });

  it("is positive where the busy files are joined to each other and the quiet ones to each other", () => {
    // Two triangles of busy files each with a tail of two quiet ones... a clique of four and a separate pair.
    const assorted = snapshot([0, 1, 2, 3, 4, 5], [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3], [4, 5]]);
    expect(assortativityOf(assorted)).toBeCloseTo(1);
  });
});

import { describe, expect, it } from "vitest";
import { clusteringOf } from "./clusteringOf";
import type { Snapshot } from "./Snapshot";

const snapshot = (ids: number[], links: [number, number][]): Snapshot => ({
  modules: ids.map((id) => ({ id, path: `${id}.ts`, lines: 1, test: false })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});

describe("how much the files a file is joined to are joined to each other", () => {
  // A triangle 0-1-2, and 3 hanging off 2.
  const clustering = clusteringOf(snapshot([0, 1, 2, 3], [[0, 1], [1, 2], [2, 0], [3, 2]]));

  it("is, for each file, the share of its neighbours' pairs that are joined, the arrows read either way", () => {
    expect(clustering.local.get(0)).toBe(1);
    // 2 has neighbours 0, 1 and 3: of their three pairs, one is joined.
    expect(clustering.local.get(2)).toBeCloseTo(1 / 3);
    expect(clustering.local.get(3)).toBe(0);
  });

  it("averages that over every file, and gives the share of joined pairs over all, the transitivity", () => {
    expect(clustering.average).toBeCloseTo((1 + 1 + 1 / 3 + 0) / 4);
    // One triangle, counted from each of its corners, over the five pairs of neighbours there are.
    expect(clustering.transitivity).toBeCloseTo(3 / 5);
  });
});

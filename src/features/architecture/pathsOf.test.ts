import { describe, expect, it } from "vitest";
import { pathsOf } from "./pathsOf";
import type { Snapshot } from "./Snapshot";

const snapshot = (ids: number[], links: [number, number][]): Snapshot => ({
  modules: ids.map((id) => ({ id, path: `${id}.ts`, lines: 1, test: false })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});

describe("how far apart the files are", () => {
  // A path 0-1-2-3, and apart from it, 4-5.
  const paths = pathsOf(snapshot([0, 1, 2, 3, 4, 5], [[0, 1], [1, 2], [2, 3], [4, 5]]));

  it("measures the largest part of the source joined together: its longest shortest way, and the mean of them all", () => {
    expect(paths.diameter).toBe(3);
    // Between the four: 1, 1, 1 apart three times, 2 twice, 3 once — ten, over six pairs.
    expect(paths.mean).toBeCloseTo(10 / 6);
  });

  it("gives each file its closeness: how near it is, on average, to the files it can reach", () => {
    expect(paths.closeness.get(1)).toBeCloseTo(3 / 4);
    expect(paths.closeness.get(0)).toBeCloseTo(3 / 6);
    expect(paths.closeness.get(4)).toBe(1);
  });
});

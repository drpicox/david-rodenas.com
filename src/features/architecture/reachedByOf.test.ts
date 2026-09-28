import { describe, expect, it } from "vitest";
import { reachedByOf } from "./reachedByOf";
import type { Snapshot } from "./Snapshot";

const snapshot = (ids: number[], links: [number, number][], tests: number[] = []): Snapshot => ({
  modules: ids.map((id) => ({ id, path: `${id}.ts`, lines: 1, test: tests.includes(id) })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});

describe("how many files a change to each could reach", () => {
  it("counts every file that needs it, near or far, and not the file itself", () => {
    // 0 needs 1, 1 needs 2, 3 needs 2.
    expect(reachedByOf(snapshot([0, 1, 2, 3], [[0, 1], [1, 2], [3, 2]]))).toEqual(new Map([[0, 0], [1, 1], [2, 3], [3, 0]]));
  });

  it("leaves the tests out", () => {
    expect(reachedByOf(snapshot([0, 1, 9], [[0, 1], [9, 1]], [9])).get(1)).toBe(1);
  });
});

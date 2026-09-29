import { describe, expect, it } from "vitest";
import { pageRankOf } from "./pageRankOf";
import type { Snapshot } from "./Snapshot";

const snapshot = (ids: number[], links: [number, number][], tests: number[] = []): Snapshot => ({
  modules: ids.map((id) => ({ id, path: `${id}.ts`, lines: 1, test: tests.includes(id) })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});

describe("how much each file is needed, by files that are themselves needed", () => {
  it("shares out a whole: every file some, the file everything needs most", () => {
    const rank = pageRankOf(snapshot([0, 1, 2, 3], [[1, 0], [2, 0], [3, 0]]));
    expect([...rank.values()].reduce((sum, value) => sum + value, 0)).toBeCloseTo(1);
    expect(rank.get(0)).toBeGreaterThan(rank.get(1) ?? Infinity);
  });

  it("weighs being needed by a needed file more than being needed by one nothing needs", () => {
    // 3 is needed by 2, which three files need; 5 is needed by 4, which nothing needs.
    const rank = pageRankOf(snapshot([0, 1, 2, 3, 4, 5, 6], [[0, 2], [1, 2], [6, 2], [2, 3], [4, 5]]));
    expect(rank.get(3)).toBeGreaterThan(rank.get(5) ?? Infinity);
  });

  it("leaves the tests out", () => {
    expect(pageRankOf(snapshot([0, 1, 9], [[0, 1], [9, 1]], [9])).has(9)).toBe(false);
  });
});

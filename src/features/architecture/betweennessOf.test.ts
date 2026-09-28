import { describe, expect, it } from "vitest";
import { betweennessOf } from "./betweennessOf";
import type { Snapshot } from "./Snapshot";

const snapshot = (ids: number[], links: [number, number][], tests: number[] = []): Snapshot => ({
  modules: ids.map((id) => ({ id, path: `${id}.ts`, lines: 1, test: tests.includes(id) })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});

describe("how much a file stands between the others", () => {
  it("counts, for every two other files, the share of the shortest ways between them that pass through it, the arrows read either way", () => {
    // 0 needs 1, 2 needs 1: the only way between 0 and 2 is through 1.
    const between = betweennessOf(snapshot([0, 1, 2], [[0, 1], [2, 1]]));
    expect([between.get(0), between.get(1), between.get(2)]).toEqual([0, 1, 0]);
  });

  it("shares a pair between two ways of the same length", () => {
    // A square: 0–1–3 and 0–2–3 are both shortest, so 1 and 2 each stand between 0 and 3 half the time, and 0 and 3 between 1 and 2 likewise.
    const between = betweennessOf(snapshot([0, 1, 2, 3], [[0, 1], [0, 2], [1, 3], [2, 3]]));
    expect([...between.values()]).toEqual([0.5, 0.5, 0.5, 0.5]);
  });

  it("leaves the tests out, which stand between nothing that ships", () => {
    const between = betweennessOf(snapshot([0, 1, 2, 9], [[0, 1], [2, 1], [9, 0], [9, 2]], [9]));
    expect(between.has(9)).toBe(false);
    expect(between.get(1)).toBe(1);
  });
});

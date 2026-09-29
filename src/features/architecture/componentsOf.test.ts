import { describe, expect, it } from "vitest";
import { componentsOf } from "./componentsOf";
import type { Snapshot } from "./Snapshot";

const snapshot = (ids: number[], links: [number, number][]): Snapshot => ({
  modules: ids.map((id) => ({ id, path: `${id}.ts`, lines: 1, test: false })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});

describe("the parts of the source joined together, the arrows read either way", () => {
  it("gives each part's files, the largest first", () => {
    expect(componentsOf(snapshot([0, 1, 2, 3, 4], [[0, 1], [2, 1], [3, 4]]))).toEqual([[0, 1, 2], [3, 4]]);
  });
});

import { describe, expect, it } from "vitest";
import { communitiesOf } from "./communitiesOf";
import { modularityOf } from "./modularityOf";
import type { Snapshot } from "./Snapshot";

const snapshot = (paths: string[], links: [number, number][]): Snapshot => ({
  modules: paths.map((path, id) => ({ id, path, lines: 1, test: path.endsWith(".test.ts") })),
  dependencies: links.map(([from, to]) => ({ from, to, typeOnly: false })),
});
// Two triangles, joined by one arrow from the one to the other.
const TRIANGLES: [number, number][] = [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3], [2, 3]];
const six = (paths = ["a/x/a.ts", "a/x/b.ts", "a/x/c.ts", "a/y/d.ts", "a/y/e.ts", "a/y/f.ts"]) => snapshot(paths, TRIANGLES);

describe("how well a grouping of the files follows the arrows", () => {
  it("is the share of the arrows inside the groups, less what that share would be were the arrows drawn at random", () => {
    // Each triangle holds 3 of the 7 arrows, and its files 7 of the 14 ends: 3/7 − (7/14)², twice.
    expect(modularityOf(six(), new Map([[0, 0], [1, 0], [2, 0], [3, 1], [4, 1], [5, 1]]))).toBeCloseTo(5 / 14);
    expect(modularityOf(six(), new Map([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]]))).toBeCloseTo(0);
  });
});

describe("the groups the arrows make of the files, with no boxes said", () => {
  it("finds the two triangles", () => {
    const groups = communitiesOf(six());
    expect(new Set([groups.get(0), groups.get(1), groups.get(2)]).size).toBe(1);
    expect(new Set([groups.get(3), groups.get(4), groups.get(5)]).size).toBe(1);
    expect(groups.get(0)).not.toBe(groups.get(3));
  });

  it("leaves the tests out", () => {
    const tested = snapshot(["a.ts", "b.ts", "a.test.ts"], [[0, 1], [2, 0]]);
    expect([...communitiesOf(tested).keys()]).toEqual([0, 1]);
  });
});

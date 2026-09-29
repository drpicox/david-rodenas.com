import { describe, expect, it } from "vitest";
import type { Snapshot } from "./Snapshot";
import { positionOf } from "./positionOf";

const file = (id: number, path: string, test = false) => ({ id, path, lines: 10, test });
// A frame file three features need, one of which needs another feature's file; and a test.
const snapshot: Snapshot = {
  modules: [file(0, "platform/p/core.ts"), file(1, "features/a/a.ts"), file(2, "features/b/b.ts"), file(3, "features/c/c.ts"), file(4, "features/c/d.ts"), file(5, "platform/p/core.test.ts", true)],
  dependencies: [
    { from: 1, to: 0, typeOnly: false },
    { from: 2, to: 0, typeOnly: false },
    { from: 3, to: 0, typeOnly: false },
    { from: 4, to: 3, typeOnly: false },
    { from: 5, to: 0, typeOnly: false },
  ],
};

describe("where a file stands in the network, its position", () => {
  const core = positionOf(snapshot, 0);

  it("counts what it needs and what needs it, near and as far as the arrows go", () => {
    expect(core).toMatchObject({ needs: 0, neededBy: 3, reaches: 4, dependsOn: 0 });
    expect(positionOf(snapshot, 4)).toMatchObject({ needs: 1, neededBy: 0, reaches: 0, dependsOn: 2 });
  });

  it("gives its place by PageRank among the files that ship, and its share of the ways between the others", () => {
    expect(core.rank).toMatchObject({ place: 1, of: 5 });
    expect(core.bridge).toBeGreaterThan(0.5);
  });

  it("places files of the same PageRank together, and says how many share the place", () => {
    // a, b and d are needed by nothing: they rank alike, and none of them stands above the others.
    for (const id of [1, 2, 4]) expect(positionOf(snapshot, id).rank).toMatchObject({ place: 3, of: 5, tied: 2 });
    expect(core.rank).toMatchObject({ place: 1, tied: 0 });
  });

  it("counts the files joined to it by an arrow either way", () => {
    expect(core.links).toBe(3);
    expect(positionOf(snapshot, 3).links).toBe(2);
  });

  it("gives how tall the stack under it is, how deep in the knot, and the tests that import it", () => {
    expect(positionOf(snapshot, 4)).toMatchObject({ height: 2, core: 1 });
    expect(core.tests).toBe(1);
  });

  it("gives the group the arrows put it in: its size, and the boxes in it, the most first", () => {
    expect(core.group.files).toBeGreaterThan(1);
    expect(core.group.boxes[0]?.[1]).toBeGreaterThan(0);
  });
});

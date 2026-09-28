import { describe, expect, it } from "vitest";
import { couplingOf } from "./couplingOf";
import type { Snapshot } from "./Snapshot";

// platform/p has three files; two features need it, one through two of their files; one of its own files needs platform/q.
const snapshot: Snapshot = {
  modules: [
    { id: 0, path: "platform/p/a.ts", lines: 1, test: false },
    { id: 1, path: "platform/p/b.ts", lines: 1, test: false },
    { id: 2, path: "platform/p/c.ts", lines: 1, test: false },
    { id: 3, path: "platform/q/d.ts", lines: 1, test: false },
    { id: 4, path: "features/f/e.ts", lines: 1, test: false },
    { id: 5, path: "features/f/g.ts", lines: 1, test: false },
    { id: 6, path: "features/h/i.ts", lines: 1, test: false },
    { id: 7, path: "platform/p/a.test.ts", lines: 1, test: true },
  ],
  dependencies: [
    { from: 4, to: 0, typeOnly: false },
    { from: 5, to: 1, typeOnly: false },
    { from: 6, to: 0, typeOnly: false },
    { from: 2, to: 3, typeOnly: false },
    { from: 1, to: 0, typeOnly: false },
    { from: 7, to: 0, typeOnly: false },
  ],
};

describe("a box's two couplings, file by file", () => {
  const coupling = couplingOf(snapshot, "platform/p");

  it("finds the files elsewhere that need something in it, by the box they are in", () => {
    expect(coupling.neededBy).toEqual([
      { box: "features/f", files: 2 },
      { box: "features/h", files: 1 },
    ]);
  });

  it("finds its own files that need something elsewhere, and the boxes they need", () => {
    expect(coupling.needing).toEqual([2]);
    expect(coupling.needs).toEqual([{ box: "platform/q", files: 1 }]);
  });

  it("has its files, and what they add up to: Ca, Ce and the instability", () => {
    expect(coupling.files).toEqual([0, 1, 2]);
    expect(coupling).toMatchObject({ ca: 3, ce: 1, instability: 0.25 });
  });
});

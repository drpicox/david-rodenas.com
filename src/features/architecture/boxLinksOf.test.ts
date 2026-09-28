import { describe, expect, it } from "vitest";
import { boxLinksOf } from "./boxLinksOf";
import type { Snapshot } from "./Snapshot";

const snapshot: Snapshot = {
  modules: [
    { id: 0, path: "features/f/a.ts", lines: 1, test: false },
    { id: 1, path: "features/f/b.ts", lines: 1, test: false },
    { id: 2, path: "platform/p/c.ts", lines: 1, test: false },
    { id: 3, path: "platform/p/D.ts", lines: 1, test: false, typesOnly: true },
    { id: 4, path: "features/f/a.test.ts", lines: 1, test: true },
  ],
  dependencies: [
    { from: 0, to: 2, typeOnly: false },
    { from: 1, to: 3, typeOnly: true },
    { from: 0, to: 1, typeOnly: false },
    { from: 4, to: 2, typeOnly: false },
  ],
};

describe("the arrows between boxes", () => {
  it("are one a pair of boxes, as many as the arrows between their files, and onto a type only if every one of them is", () => {
    expect(boxLinksOf(snapshot)).toEqual([{ from: "features/f", to: "platform/p", count: 2, typeOnly: false }]);
  });

  it("count the tests' arrows only when the tests are in", () => {
    expect(boxLinksOf(snapshot, true)[0]?.count).toBe(3);
  });
});

import { describe, expect, it } from "vitest";
import { encodeHistory } from "./encodeHistory";
import { readHistory } from "./readHistory";
import { shapesOf } from "./shapesOf";

const file = (path: string) => ({ path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: false });
const needs = (from: string, to: string) => ({ from, to, typeOnly: false });
const commit = (sha: string, day: number) => ({ sha, date: `2026-09-0${day}T10:00:00+02:00`, subject: sha });
const read = readHistory(
  JSON.stringify(
    encodeHistory([
      { commit: commit("aaaaaaa", 1), graph: { modules: [file("platform/a/a.ts"), file("features/f/f.ts")], dependencies: [needs("features/f/f.ts", "platform/a/a.ts")] }, renamed: [], touched: [] },
      // A test comes for a.ts: one file fewer that no test imports.
      { commit: commit("bbbbbbb", 2), graph: { modules: [file("platform/a/a.ts"), file("features/f/f.ts"), file("platform/a/a.test.ts")], dependencies: [needs("features/f/f.ts", "platform/a/a.ts"), needs("platform/a/a.test.ts", "platform/a/a.ts")] }, renamed: [], touched: ["platform/a/a.test.ts"] },
    ]),
  ),
);

describe("the shape of the source at every commit of its history", () => {
  it("is measured as the ratchet measures it, commit by commit", () => {
    const shapes = shapesOf(read);
    expect(shapes.map((shape) => shape.untested)).toEqual([2, 1]);
    expect(shapes.map((shape) => shape.tallestStack)).toEqual([1, 1]);
  });
});

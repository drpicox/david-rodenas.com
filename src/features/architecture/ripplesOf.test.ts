import { describe, expect, it } from "vitest";
import { decodeHistory } from "./decodeHistory";
import { encodeHistory } from "./encodeHistory";
import { ripplesOf } from "./ripplesOf";

// A box p with a shape and what draws it; a box f whose files need p, one of them only its shape; one of f's needing another; and a test.
const PATHS = ["p/q/Shape.ts", "p/q/draw.ts", "f/g/f.ts", "f/g/g.ts", "f/g/h.ts", "p/q/draw.test.ts"];
const ARROWS: [string, string, boolean][] = [
  ["p/q/draw.ts", "p/q/Shape.ts", true],
  ["f/g/f.ts", "p/q/draw.ts", false],
  ["f/g/g.ts", "p/q/Shape.ts", true],
  ["f/g/h.ts", "f/g/f.ts", false],
  ["p/q/draw.test.ts", "p/q/draw.ts", false],
];
const graph = { modules: PATHS.map((path) => ({ path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: path.endsWith("Shape.ts") })), dependencies: ARROWS.map(([from, to, typeOnly]) => ({ from, to, typeOnly })) };
const commit = (sha: string, touched: string[]) => ({ commit: { sha, date: "2026-09-07", subject: sha }, graph, renamed: [], touched });
const history = encodeHistory([
  commit("written", []),
  commit("the shape, and what draws it", ["p/q/Shape.ts", "p/q/draw.ts"]),
  commit("the drawing, and f with it", ["p/q/draw.ts", "f/g/f.ts", "p/q/draw.test.ts"]),
  commit("f alone", ["f/g/f.ts"]),
]);

describe("what each kind of arrow carries", () => {
  it("counts, for the arrows of each kind, the changes at their heads, and how many the file at the tail changed with", () => {
    expect(ripplesOf(history, decodeHistory(history))).toEqual([
      // h needs f, and f changed twice without it.
      { across: false, typeOnly: false, changes: 2, carried: 0 },
      // The drawing changed with its shape.
      { across: false, typeOnly: true, changes: 1, carried: 1 },
      // f needs the drawing: the first time it stood still, the second it changed with it. The test's arrow is not counted.
      { across: true, typeOnly: false, changes: 2, carried: 1 },
      // g needs only the shape, and stood still when it changed.
      { across: true, typeOnly: true, changes: 1, carried: 0 },
    ]);
  });

  it("leaves out a sweep", () => {
    expect(ripplesOf(history, decodeHistory(history), 2).map(({ changes }) => changes)).toEqual([1, 1, 1, 1]);
  });
});

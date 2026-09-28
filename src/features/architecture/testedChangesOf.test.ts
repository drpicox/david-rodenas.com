import { describe, expect, it } from "vitest";
import { decodeHistory } from "./decodeHistory";
import { encodeHistory } from "./encodeHistory";
import type { SourceGraph } from "./SourceGraph";
import { testedChangesOf } from "./testedChangesOf";

const graph = (paths: string[], arrows: [string, string][]): SourceGraph => ({
  modules: paths.map((path) => ({ path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: path === "T.ts" })),
  dependencies: arrows.map(([from, to]) => ({ from, to, typeOnly: false })),
});
const before = graph(["a.ts", "a.test.ts", "b.ts", "b.test.ts", "c.ts", "T.ts"], [["a.test.ts", "a.ts"], ["b.test.ts", "b.ts"], ["a.ts", "T.ts"]]);
const after = graph(["a.ts", "a.test.ts", "b.ts", "b.test.ts", "b2.test.ts", "c.ts", "T.ts"], [["a.test.ts", "a.ts"], ["b.test.ts", "b.ts"], ["b2.test.ts", "b.ts"], ["a.ts", "T.ts"]]);
const commit = (sha: string, source: SourceGraph, touched: string[]) => ({ commit: { sha, date: "2026-09-07", subject: sha }, graph: source, renamed: [], touched });
const history = encodeHistory([
  commit("written", before, []),
  commit("a, with its test", before, ["a.ts", "a.test.ts"]),
  commit("b, without", before, ["b.ts"]),
  commit("c, which nothing tests", before, ["c.ts"]),
  commit("the types", before, ["T.ts"]),
  commit("b, with a new test", after, ["b.ts"]),
]);

describe("the changes that came with their tests", () => {
  it("counts the changes to a file a test imports, the ones that came with a change to such a test, or a new one, and the changes to files no test imports", () => {
    expect(testedChangesOf(history, decodeHistory(history))).toEqual({ tested: 3, withTest: 2, untested: 1 });
  });

  it("leaves out a sweep", () => {
    expect(testedChangesOf(history, decodeHistory(history), 1)).toEqual({ tested: 2, withTest: 1, untested: 1 });
  });
});

import { describe, expect, it } from "vitest";
import { decodeHistory } from "./decodeHistory";
import { encodeHistory } from "./encodeHistory";
import type { SourceGraph } from "./SourceGraph";

const commit = (sha: string) => ({ sha, date: "2026-09-07", subject: sha });
const module = (path: string, lines = 10) => ({ path, lines, test: path.endsWith(".test.ts"), typesOnly: false });
const needs = (from: string, to: string, typeOnly = false) => ({ from, to, typeOnly });

const first: SourceGraph = { modules: [module("core/a.ts"), module("core/b.ts"), module("ui/c.ts")], dependencies: [needs("ui/c.ts", "core/a.ts"), needs("core/a.ts", "core/b.ts", true)] };
const second: SourceGraph = { modules: [module("platform/a.ts", 12), module("core/b.ts"), module("features/d.ts")], dependencies: [needs("features/d.ts", "platform/a.ts"), needs("platform/a.ts", "core/b.ts")] };

// Git saw the second commit edit core/b.ts, rename core/a.ts with an edit, bring features/d.ts, and touch the stylesheet.
const played = [
  { commit: commit("one"), graph: first, renamed: [], touched: [] },
  { commit: commit("two"), graph: second, renamed: [["core/a.ts", "platform/a.ts"] as const], touched: ["core/b.ts", "platform/a.ts", "features/d.ts", "styles.css"] },
];

describe("the history of the source, kept as what changed", () => {
  const history = encodeHistory(played);

  it("keeps a module's number across a rename, so it is the same ball, moved", () => {
    expect(history.changes[1]?.moved).toEqual([[0, "platform/a.ts"]]);
    expect(history.changes[1]?.resized).toEqual([[0, 12]]);
  });

  it("says what appeared and what went, modules and arrows", () => {
    const [, change] = history.changes;
    expect(change?.added).toEqual([[3, "features/d.ts", 10, false]]);
    expect(change?.removed).toEqual([2]);
    expect(change?.unlinked).toEqual([[2, 0]]);
    expect(change?.linked).toEqual([[3, 0, false], [0, 1, false]]);
  });

  it("says which modules a commit changed, by their number: a file edited or moved, never one it brought, nor what is not a module", () => {
    expect(history.changes[1]?.changed).toEqual([0, 1]);
  });

  it("gives every snapshot back whole, as it was at its commit", () => {
    const snapshots = decodeHistory(history);
    expect(snapshots[0]?.modules.map((one) => one.path)).toEqual(["core/a.ts", "core/b.ts", "ui/c.ts"]);
    expect(snapshots[1]).toEqual({
      modules: [
        { id: 0, path: "platform/a.ts", lines: 12, test: false },
        { id: 1, path: "core/b.ts", lines: 10, test: false },
        { id: 3, path: "features/d.ts", lines: 10, test: false },
      ],
      dependencies: [
        { from: 0, to: 1, typeOnly: false },
        { from: 3, to: 0, typeOnly: false },
      ],
    });
  });

  it("is small: an unchanged commit costs nothing but its line", () => {
    const again = encodeHistory([...played, { commit: commit("three"), graph: second, renamed: [], touched: [] }]);
    expect(again.changes[2]).toEqual({ added: [], removed: [], moved: [], resized: [], retyped: [], changed: [], linked: [], unlinked: [] });
  });

  it("says when a module comes to hold nothing but types, or stops, and gives it back so", () => {
    const typed = (typesOnly: boolean) => ({ modules: [{ path: "a.ts", lines: 10, test: false, typesOnly }], dependencies: [] });
    const retyped = encodeHistory([
      { commit: commit("with a value"), graph: typed(false), renamed: [], touched: [] },
      { commit: commit("the value moved out"), graph: typed(true), renamed: [], touched: ["a.ts"] },
    ]);
    expect(retyped.changes[1]?.retyped).toEqual([[0, true]]);
    expect(decodeHistory(retyped)[1]?.modules[0]?.typesOnly).toBe(true);
  });
});

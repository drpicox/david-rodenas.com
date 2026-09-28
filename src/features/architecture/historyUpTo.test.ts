import { describe, expect, it } from "vitest";
import { encodeHistory } from "./encodeHistory";
import { historyUpTo } from "./historyUpTo";
import { readHistory } from "./readHistory";

const graph = (paths: string[]) => ({ modules: paths.map((path) => ({ path, lines: 10, test: false, typesOnly: false })), dependencies: [] });
const step = (sha: string, paths: string[], touched: string[], renamed: [string, string][] = []) => ({ commit: { sha, date: "2026-09-07", subject: sha }, graph: graph(paths), renamed, touched });
const read = readHistory(
  JSON.stringify(
    encodeHistory([
      step("one", ["core/a.ts", "core/b.ts"], []),
      step("two", ["core/a.ts", "core/b.ts"], ["core/a.ts"]),
      step("three", ["platform/a.ts", "core/b.ts", "core/c.ts"], ["platform/a.ts"], [["core/a.ts", "platform/a.ts"]]),
      step("four", ["platform/a.ts", "core/c.ts"], ["core/c.ts"]),
    ]),
  ),
);

describe("the history as it stood at one of its commits", () => {
  it("ends at that commit, with its snapshots", () => {
    const then = historyUpTo(read, 1);
    expect(then.history.commits.map(({ sha }) => sha)).toEqual(["one", "two"]);
    expect(then.snapshots).toHaveLength(2);
  });

  it("knows each file as it was then: where it stood, what had changed it, and not what came after", () => {
    const then = historyUpTo(read, 1);
    expect(then.lives.map(({ path, changed, went }) => ({ path, changed, went }))).toEqual([
      { path: "core/a.ts", changed: [1], went: undefined },
      { path: "core/b.ts", changed: [], went: undefined },
    ]);
  });

  it("is the whole history at the last commit, and the same answer when asked twice", () => {
    expect(historyUpTo(read, 3).lives).toEqual(read.lives);
    expect(historyUpTo(read, 2)).toBe(historyUpTo(read, 2));
  });
});

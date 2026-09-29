import { describe, expect, it } from "vitest";
import type { SourceGraph } from "./SourceGraph";
import { unrunOf } from "./unrunOf";

const at = (line: number) => ({ start: { line, column: 0 }, end: { line, column: 10 } });
/** Coverage as vitest writes it, per file: each function and statement where it is, and how often a test ran it. */
const covered = (runs: Record<string, { functions: [string, number, number][]; statements: [number, number][] }>) =>
  Object.fromEntries(
    Object.entries(runs).map(([path, { functions, statements }]) => [
      `/repo/src/${path}`,
      {
        path: `/repo/src/${path}`,
        fnMap: Object.fromEntries(functions.map(([name, line], id) => [String(id), { name, decl: at(line), loc: at(line) }])),
        f: Object.fromEntries(functions.map(([, , times], id) => [String(id), times])),
        statementMap: Object.fromEntries(statements.map(([line], id) => [String(id), at(line)])),
        s: Object.fromEntries(statements.map(([, times], id) => [String(id), times])),
      },
    ]),
  );
const file = (path: string, test = false) => ({ path, lines: 20, test, typesOnly: false });
const graph: SourceGraph = {
  modules: [file("main.ts"), file("platform/p/used.ts"), file("platform/p/lonely.ts"), file("features/f/browser/mountF.ts"), file("features/f/f.ts"), file("features/f/f.test.ts", true)],
  dependencies: [
    { from: "main.ts", to: "features/f/browser/mountF.ts", typeOnly: false },
    { from: "features/f/browser/mountF.ts", to: "features/f/f.ts", typeOnly: false },
    { from: "features/f/f.ts", to: "platform/p/used.ts", typeOnly: false },
  ],
};

describe("the code no test runs, and what it asks", () => {
  const unrun = unrunOf(
    covered({
      "platform/p/used.ts": { functions: [["used", 1, 0]], statements: [[2, 0], [3, 0], [5, 0]] },
      "platform/p/lonely.ts": { functions: [["lonely", 1, 0]], statements: [[2, 0]] },
      "features/f/browser/mountF.ts": { functions: [["mountF", 1, 0]], statements: [[2, 0]] },
      "features/f/f.ts": { functions: [["f", 1, 3]], statements: [[2, 3]] },
    }),
    graph,
    new Set(),
  );

  it("asks of a file nothing uses whether it has a purpose at all, of one only a browser runs whether it is hard to test, and of the rest what behaviour no test states", () => {
    expect(unrun.map(({ path, asks }) => [path, asks])).toEqual([
      ["platform/p/lonely.ts", "unused"],
      ["features/f/browser/mountF.ts", "browser"],
      ["platform/p/used.ts", "unstated"],
    ]);
  });

  it("names the functions no test ran, and the lines, as ranges", () => {
    expect(unrun.find(({ path }) => path === "platform/p/used.ts")).toMatchObject({ functions: [{ name: "used", line: 1 }], lines: [[2, 3], [5, 5]] });
  });

  it("leaves out what the tests run whole, and a file a tool or a hook loads is used", () => {
    expect(unrun.some(({ path }) => path === "features/f/f.ts")).toBe(false);
    const loaded = unrunOf(covered({ "platform/p/lonely.ts": { functions: [["lonely", 1, 0]], statements: [[2, 0]] } }), graph, new Set(["platform/p/lonely.ts"]));
    expect(loaded[0]?.asks).toBe("unstated");
  });
});

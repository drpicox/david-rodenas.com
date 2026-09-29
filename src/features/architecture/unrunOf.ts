import type { SourceGraph } from "./SourceGraph";

interface Place {
  readonly start: { readonly line: number };
}

/** Coverage as vitest writes it, file by file: every function and statement, where it is, and how many times the tests ran it. */
export type RunCounts = Readonly<
  Record<
    string,
    {
      readonly fnMap: Readonly<Record<string, { readonly name: string; readonly decl: Place }>>;
      readonly f: Readonly<Record<string, number>>;
      readonly statementMap: Readonly<Record<string, Place>>;
      readonly s: Readonly<Record<string, number>>;
    }
  >
>;

/** A file with code no test runs, and what that asks. */
export interface Unrun {
  readonly path: string;
  readonly functions: readonly { readonly name: string; readonly line: number }[];
  /** The lines of the statements no test ran, as ranges. */
  readonly lines: readonly (readonly [number, number])[];
  /**
   * `unused`: nothing in the site uses the file — it has no purpose, or only a
   * test's. `browser`: only a browser runs it — it is hard to test here.
   * `unstated`: the site uses it and no test runs it — a behaviour no test
   * states, or code with none worth stating.
   */
  readonly asks: "unused" | "browser" | "unstated";
}

const ORDER = ["unused", "browser", "unstated"] as const;
const BROWSER = /(^|\/)browser\//;

/** Lines as ranges: 2, 3 and 5 are 2–3 and 5. */
function rangesOf(lines: readonly number[]): [number, number][] {
  const ranges: [number, number][] = [];
  for (const line of [...new Set(lines)].sort((a, b) => a - b)) {
    const last = ranges.at(-1);
    if (last && line === last[1] + 1) last[1] = line;
    else ranges.push([line, line]);
  }
  return ranges;
}

/**
 * The code no test runs, file by file: the functions no test ran, and the
 * lines. Coverage is not a target, but a line no test runs asks one of three
 * things, and the file says which: nothing in the site uses it — then it has
 * no purpose, or only a test's, and can go, or move into the test; only a
 * browser runs it — then it is hard to test here, and wants a test in a page,
 * or what it decides moved out of the browser; or the site uses it and no test
 * runs it — then it has a behaviour no test states yet, or none worth stating.
 * A file a tool or a hook loads, by path, is used.
 */
export function unrunOf(coverage: RunCounts, graph: SourceGraph, loadedElsewhere: ReadonlySet<string>): Unrun[] {
  const shipped = new Map(graph.modules.filter((module) => !module.test).map((module) => [module.path, module]));
  const imported = new Set(graph.dependencies.filter(({ from }) => shipped.has(from)).map(({ to }) => to));
  return Object.entries(coverage)
    .flatMap(([absolute, file]): Unrun[] => {
      const path = absolute.slice(absolute.lastIndexOf("/src/") + 5);
      const module = shipped.get(path);
      if (!module || module.typesOnly) return [];
      const functions = Object.entries(file.fnMap)
        .filter(([id]) => file.f[id] === 0)
        .map(([, fn]) => ({ name: fn.name, line: fn.decl.start.line }));
      const lines = rangesOf(
        Object.entries(file.statementMap)
          .filter(([id]) => file.s[id] === 0)
          .map(([, statement]) => statement.start.line),
      );
      if (functions.length === 0 && lines.length === 0) return [];
      const used = imported.has(path) || path === "main.ts" || loadedElsewhere.has(path);
      const asks = !used ? "unused" : BROWSER.test(path) || path === "main.ts" ? "browser" : "unstated";
      return [{ path, functions, lines, asks }];
    })
    .sort((a, b) => {
      const size = (unrun: Unrun) => unrun.lines.reduce((sum, [from, to]) => sum + to - from + 1, 0);
      return ORDER.indexOf(a.asks) - ORDER.indexOf(b.asks) || size(b) - size(a) || a.path.localeCompare(b.path);
    });
}

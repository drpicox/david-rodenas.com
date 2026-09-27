import { posix } from "node:path";
import { importsOf } from "./importsOf";
import { onlyTypes } from "./onlyTypes";
import type { Dependency, SourceGraph } from "./SourceGraph";

export interface Source {
  /** Relative to `src/`. */
  readonly path: string;
  readonly text: string;
}

/** The file a relative import names: itself, with `.ts`, or a folder's index. Anything else — a package, a stylesheet, a virtual module — is not source. */
function resolved(from: string, specifier: string, known: ReadonlySet<string>): string | undefined {
  if (!specifier.startsWith(".")) return undefined;
  const target = posix.normalize(posix.join(posix.dirname(from), specifier));
  return [`${target}.ts`, target, `${target}/index.ts`].find((candidate) => candidate.endsWith(".ts") && known.has(candidate));
}

/**
 * The source as a graph: a module for each file, an arrow for each file it
 * needs. Two imports from the same file are one arrow, and it needs only a
 * type if neither needs a value.
 */
export function readGraph(sources: readonly Source[]): SourceGraph {
  const known = new Set(sources.map((source) => source.path));
  const modules = sources.map((source) => ({ path: source.path, lines: source.text.split("\n").length, test: source.path.endsWith(".test.ts"), typesOnly: onlyTypes(source.text) }));
  const dependencies: Dependency[] = [];
  for (const source of sources) {
    const arrows = new Map<string, boolean>();
    for (const { specifier, typeOnly } of importsOf(source.text)) {
      const to = resolved(source.path, specifier, known);
      if (to === undefined || to === source.path) continue;
      arrows.set(to, (arrows.get(to) ?? true) && typeOnly);
    }
    for (const [to, typeOnly] of arrows) dependencies.push({ from: source.path, to, typeOnly });
  }
  return { modules, dependencies };
}

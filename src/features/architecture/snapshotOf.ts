import type { Snapshot } from "./Snapshot";
import type { SourceGraph } from "./SourceGraph";

/** The source as the compiler reads it, numbered the way a commit of the history is, so that every measure made for the history can read it too. */
export function snapshotOf(graph: SourceGraph): Snapshot {
  const idOf = new Map(graph.modules.map((module, id) => [module.path, id]));
  return {
    modules: graph.modules.map(({ path, lines, test, typesOnly }, id) => ({ id, path, lines, test, typesOnly })),
    dependencies: graph.dependencies.flatMap(({ from, to, typeOnly }) => {
      const [a, b] = [idOf.get(from), idOf.get(to)];
      return a !== undefined && b !== undefined ? [{ from: a, to: b, typeOnly }] : [];
    }),
  };
}

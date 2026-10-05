import type { CodeGraph } from "./CodeGraph";

/** Only some nodes of a graph, the arrows among them, and what was measured of them: measured before, not again among fewer. */
export function subgraphOf(graph: CodeGraph, keep: ReadonlySet<number>): CodeGraph {
  return {
    ...graph,
    snapshot: {
      modules: graph.snapshot.modules.filter((module) => keep.has(module.id)),
      dependencies: graph.snapshot.dependencies.filter(({ from, to }) => keep.has(from) && keep.has(to)),
    },
    ...(graph.members && { members: new Map([...graph.members].filter(([id]) => keep.has(id))) }),
  };
}

import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { measuresOf } from "../measuresOf";
import type { CodeGraph } from "./CodeGraph";
import { subgraphOf } from "./subgraphOf";

/**
 * The knot: only the files of a core at least as deep as asked — what is left
 * when every file with fewer neighbours is taken away, again and again — or,
 * left to it, of the deepest core there is: the files that hold each other up.
 */
export const knotNode: NodeKind = {
  name: "knot",
  title: "The knot",
  role: "step",
  shelf: "This site",
  summary: "Only the files of a core at least as deep as asked — the deepest, left to it: the files that hold each other up (Seidman, 1983).",
  inputs: [
    { name: "graph", label: "graph", type: "graph" },
    { name: "depth", label: "at least", type: "number", optional: true, editor: { kind: "number", min: 1, max: 20, step: 1 } },
  ],
  outputs: [{ name: "graph", label: "graph", type: "graph" }],
  run: (inputs) => {
    const graph = inputs["graph"] as CodeGraph;
    const cores = measuresOf.cores(graph.snapshot);
    const deepest = Math.max(0, ...cores.values());
    const depth = inputs["depth"] === undefined ? deepest : Math.round(Number(inputs["depth"]));
    const keep = new Set([...cores].filter(([, core]) => core >= depth).map(([id]) => id));
    return { outputs: { graph: subgraphOf(graph, keep) }, said: `core ${depth} or deeper: ${keep.size} ${graph.of}; the deepest is ${deepest}`, settled: { depth } };
  },
};

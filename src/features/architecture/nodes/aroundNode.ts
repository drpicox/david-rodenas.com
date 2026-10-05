import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { CodeGraph } from "./CodeGraph";
import { subgraphOf } from "./subgraphOf";

/**
 * One file and the files around it, as far as asked along the arrows: what
 * it needs, what needs it, or both — the neighbourhood a change to it would
 * walk into first.
 */
export const aroundNode: NodeKind = {
  name: "around",
  title: "Around a file",
  role: "step",
  shelf: "This site",
  summary: "One file and the files around it, as many arrows out as asked: what it needs, what needs it, or both.",
  inputs: [
    { name: "graph", label: "graph", type: "graph" },
    { name: "file", label: "file", type: "text", initial: "Feature.ts", hint: "words its path contains: the first file that does" },
    { name: "steps", label: "arrows out", type: "number", initial: 1, editor: { kind: "number", min: 1, max: 12, step: 1 } },
    { name: "way", label: "along", type: "text", initial: "both", editor: { kind: "choice", choices: [{ value: "needs", label: "what it needs" }, { value: "needed", label: "what needs it" }, { value: "both", label: "both" }] } },
  ],
  outputs: [{ name: "graph", label: "graph", type: "graph" }],
  run: (inputs) => {
    const graph = inputs["graph"] as CodeGraph;
    const words = String(inputs["file"] ?? "");
    const start = graph.snapshot.modules.find((module) => module.path.endsWith(`/${words}`) || module.path === words) ?? graph.snapshot.modules.find((module) => module.path.includes(words));
    if (!start || words === "") throw new Error(`file: no ${graph.of === "boxes" ? "box" : "file"}'s path has ${words || "nothing"} in it`);
    const way = String(inputs["way"]);
    const next = new Map<number, number[]>();
    for (const { from, to } of graph.snapshot.dependencies) {
      if (way !== "needed") next.set(from, [...(next.get(from) ?? []), to]);
      if (way !== "needs") next.set(to, [...(next.get(to) ?? []), from]);
    }
    const reached = new Set([start.id]);
    let edge = [start.id];
    for (let step = 0; step < Math.round(Number(inputs["steps"])) && edge.length > 0; step += 1) {
      edge = edge.flatMap((id) => (next.get(id) ?? []).filter((other) => !reached.has(other)));
      for (const id of edge) reached.add(id);
    }
    return { outputs: { graph: subgraphOf(graph, reached) }, said: `${start.path} and ${reached.size - 1} around it`, settled: { file: start.path } };
  },
};

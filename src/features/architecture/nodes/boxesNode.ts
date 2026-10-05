import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { boxLinksOf } from "../boxLinksOf";
import { boxOf } from "../boxOf";
import type { CodeGraph, Measured } from "./CodeGraph";

/**
 * The graph a box a node: every file gathered into its box — a folder of the
 * frame, or a feature — and every arrow between two boxes into one. What was
 * measured of the files is added up into their box, so a box's changes are
 * its files' changes.
 */
export const boxesNode: NodeKind = {
  name: "boxes",
  title: "Into boxes",
  role: "step",
  shelf: "This site",
  summary: "Every file gathered into its box — a folder of the frame, or a feature — and the arrows between boxes, its files' measures added up.",
  inputs: [{ name: "graph", label: "graph", type: "graph" }],
  outputs: [{ name: "graph", label: "graph", type: "graph" }],
  run: (inputs) => {
    const graph = inputs["graph"] as CodeGraph;
    if (graph.of === "boxes") return { outputs: { graph } };
    const names = [...new Set(graph.snapshot.modules.map((module) => boxOf(module.path)))].sort((a, b) => a.localeCompare(b));
    const idOf = new Map(names.map((name, at) => [name, at]));
    const members = new Map<number, number[]>(names.map((_, at) => [at, []]));
    for (const module of graph.snapshot.modules) members.get(idOf.get(boxOf(module.path)) ?? 0)?.push(module.id);
    const linesOf = new Map(graph.snapshot.modules.map((module) => [module.id, module.lines]));
    const modules = names.map((name, at) => ({ id: at, path: name, lines: (members.get(at) ?? []).reduce((sum, id) => sum + (linesOf.get(id) ?? 0), 0), test: false }));
    const dependencies = boxLinksOf(graph.snapshot, true).map((link) => ({ from: idOf.get(link.from) ?? 0, to: idOf.get(link.to) ?? 0, typeOnly: link.typeOnly }));
    const measured: Measured[] = graph.measured
      .filter((each) => each.column.kind === "number")
      .map((each) => ({ column: { ...each.column, about: `its files' ${each.column.name}, added up` }, values: new Map([...members].map(([box, files]) => [box, files.reduce((sum, file) => sum + Number(each.values.get(file) ?? 0), 0)])) }));
    return { outputs: { graph: { snapshot: { modules, dependencies }, of: "boxes", members, measured, read: graph.read, at: graph.at } satisfies CodeGraph } };
  },
};

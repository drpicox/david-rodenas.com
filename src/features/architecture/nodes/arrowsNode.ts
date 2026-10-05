import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Table } from "../../../platform/blueprint/Table";
import { boxOf } from "../boxOf";
import type { CodeGraph } from "./CodeGraph";

/** A graph as the table of its arrows: what needs what, between which boxes, and whether all it needs is a type. */
export const arrowsNode: NodeKind = {
  name: "arrows",
  title: "Its arrows",
  role: "step",
  shelf: "This site",
  summary: "A graph as the table of its arrows: what needs what, between which boxes, and whether all it needs is a type.",
  inputs: [{ name: "graph", label: "graph", type: "graph" }],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const graph = inputs["graph"] as CodeGraph;
    const pathOf = new Map(graph.snapshot.modules.map((module) => [module.id, module.path]));
    const boxIn = (path: string) => (graph.of === "boxes" ? path : boxOf(path));
    const rows = graph.snapshot.dependencies.map(({ from, to, typeOnly }) => {
      const [a, b] = [pathOf.get(from) ?? "", pathOf.get(to) ?? ""];
      return { from: a, to: b, "from box": boxIn(a), "to box": boxIn(b), crossing: boxIn(a) === boxIn(b) ? "no" : "yes", "types only": typeOnly ? "yes" : "no" };
    });
    const table: Table = {
      columns: [
        { name: "from", kind: "text", key: true },
        { name: "to", kind: "text", key: true },
        { name: "from box", kind: "text" },
        { name: "to box", kind: "text" },
        { name: "crossing", kind: "text", about: "yes when it goes from one box into another" },
        { name: "types only", kind: "text", about: "yes when all it needs is a type: an interface, not what implements it" },
      ],
      rows,
    };
    return { outputs: { table } };
  },
};

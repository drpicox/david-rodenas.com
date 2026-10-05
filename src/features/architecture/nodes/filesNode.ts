import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { CodeGraph } from "./CodeGraph";
import { graphTableOf } from "./graphTableOf";

/** A graph as the table of its nodes, every column measured on the way: for any table step, statistic or picture. A graph wired into a table goes this way by itself. */
export const filesNode: NodeKind = {
  name: "files",
  title: "As a table",
  role: "step",
  shelf: "This site",
  summary: "A graph as the table of its files, or boxes: path, box, lines, how many need it and it needs, and every column measured on the way.",
  inputs: [{ name: "graph", label: "graph", type: "graph" }],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => ({ outputs: { table: graphTableOf(inputs["graph"] as CodeGraph) } }),
};

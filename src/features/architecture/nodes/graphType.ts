import type { PinType } from "../../../platform/blueprint/PinType";
import type { CodeGraph } from "./CodeGraph";
import { graphTableOf } from "./graphTableOf";

/**
 * A graph of this site's source — files, or boxes of files, and the arrows
 * between them — drawn in a colour of its own, and also, wherever a table is
 * taken, the table of its nodes.
 */
export const graphType: PinType = {
  name: "graph",
  label: "a graph",
  colour: "--bp-graph",
  describe: (value) => {
    const { snapshot, of } = value as CodeGraph;
    return `${snapshot.modules.length} ${of} · ${snapshot.dependencies.length} arrows`;
  },
  becomes: { table: (value) => graphTableOf(value as CodeGraph) },
};

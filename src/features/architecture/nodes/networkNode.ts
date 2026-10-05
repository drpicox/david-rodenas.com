import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { numberSaid } from "../../../platform/blueprint/numberSaid";
import type { Table } from "../../../platform/blueprint/Table";
import { modularityOf } from "../modularityOf";
import { measuresOf } from "../measuresOf";
import { networkOf } from "../networkOf";
import type { CodeGraph } from "./CodeGraph";

const FIGURES = [
  ["files", "files", "the files that ship"],
  ["arrows", "arrows", "files that need another, each pair once"],
  ["density", "density", "the arrows there are over the arrows there could be"],
  ["clustering", "clustering", "how much a file's neighbours are neighbours of each other, on average"],
  ["path", "mean path", "the mean of the shortest ways between two files"],
  ["small-world", "small world", "the clustering over a random network's, over the paths over a random network's (Humphries and Gurney, 2008)"],
  ["core", "deepest core", "how deep the knot is"],
  ["stack", "tallest stack", "the longest chain of what needs what, in arrows"],
  ["modularity", "modularity", "how much the groups the arrows make keep their arrows inside (Newman and Girvan, 2004)"],
] as const;

/** The graph as network science reads any network, in figures: each a number to wire on, and all of them as a table. */
export const networkNode: NodeKind = {
  name: "network",
  title: "Network figures",
  role: "statistic",
  shelf: "This site",
  summary: "The graph in the figures network science reads any network by: files, arrows, density, clustering, mean path, small-world-ness, core, stack, modularity.",
  inputs: [{ name: "graph", label: "graph", type: "graph" }],
  outputs: [...FIGURES.map(([name, label]) => ({ name, label, type: "number" })), { name: "table", label: "as a table", type: "table" }],
  run: (inputs) => {
    const { snapshot } = inputs["graph"] as CodeGraph;
    const network = networkOf(snapshot);
    const figures: Record<(typeof FIGURES)[number][0], number> = {
      files: network.files,
      arrows: network.arrows,
      density: network.density,
      clustering: network.clustering,
      path: network.meanPath,
      "small-world": network.smallWorld,
      core: network.deepestCore,
      stack: network.tallest,
      modularity: modularityOf(snapshot, measuresOf.groups(snapshot)),
    };
    const table: Table = {
      columns: [{ name: "figure", kind: "text", key: true }, { name: "value", kind: "number" }, { name: "what", kind: "text" }],
      rows: FIGURES.map(([name, label, what]) => ({ figure: label, value: figures[name], what })),
    };
    return { outputs: { ...figures, table }, said: `${network.files} files · small world ${numberSaid(network.smallWorld)}` };
  },
};

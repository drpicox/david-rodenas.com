import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Cell, Column } from "../../../platform/blueprint/Table";
import { changesUpTo } from "../changesUpTo";
import { heatOf } from "../heatOf";
import { measuresOf } from "../measuresOf";
import type { Snapshot } from "../Snapshot";
import { sweepsOf } from "../sweepsOf";
import type { CodeGraph } from "./CodeGraph";

interface Measure {
  readonly label: string;
  readonly about: string;
  /** Measured on the graph's own nodes — or, when it looks back over the history, on files, and added up into boxes. */
  readonly of: (graph: CodeGraph) => ReadonlyMap<number, Cell>;
  readonly kind?: "text";
}

const onNodes = (measure: (snapshot: Snapshot) => ReadonlyMap<number, number>) => (graph: CodeGraph) => measure(graph.snapshot);

/** A measure that looks back over the history, which is of files: a graph of boxes adds its files' up. */
const onFiles = (measure: (graph: CodeGraph) => ReadonlyMap<number, number>) => (graph: CodeGraph) => {
  const byFile = measure(graph);
  if (graph.of === "files" || !graph.members) return byFile;
  return new Map([...graph.members].map(([box, files]) => [box, files.reduce((sum, file) => sum + (byFile.get(file) ?? 0), 0)]));
};

const MEASURES: Readonly<Record<string, Measure>> = {
  pagerank: { label: "PageRank", about: "how much it is needed by what is itself needed (Brin and Page, 1998)", of: onNodes(measuresOf.pageRank) },
  bridges: { label: "bridges", about: "the share of the shortest ways between two others that pass through it (Freeman, 1978)", of: onNodes(measuresOf.bridges) },
  reach: { label: "reach", about: "how many others a change to it could reach, as far as the arrows go", of: onNodes(measuresOf.reach) },
  core: { label: "core", about: "how deep in the knot it sits: its core number (Seidman, 1983)", of: onNodes(measuresOf.cores) },
  stack: { label: "stack", about: "the arrows of the longest chain of what it needs", of: onNodes(measuresOf.heights) },
  closeness: { label: "closeness", about: "how near it is to the rest, the arrows read either way (Freeman, 1978)", of: onNodes((snapshot) => measuresOf.paths(snapshot).closeness) },
  clustering: { label: "clustering", about: "the share of its neighbours that are neighbours of each other", of: onNodes((snapshot) => measuresOf.clustering(snapshot).local) },
  group: {
    label: "group",
    about: "the group the arrows gather it into, found by the Louvain method (Blondel and others, 2008)",
    kind: "text",
    of: (graph) => new Map([...measuresOf.groups(graph.snapshot)].map(([id, group]) => [id, `group ${group + 1}`])),
  },
  changes: { label: "changes", about: "the commits that changed it so far, sweeps left out", of: onFiles((graph) => changesUpTo(graph.read.lives, graph.at, sweepsOf(graph.read.history))) },
  heat: { label: "heat", about: "how lately it changed: a change counts one, halving every six commits", of: onFiles((graph) => heatOf(graph.read.lives, graph.at, 6, sweepsOf(graph.read.history))) },
};

/**
 * One more column for every node of a graph, measured as network science
 * measures any network — how needed, how much in between, how deep in the
 * knot, in which group — or as the history has it: how often, and how
 * lately, it changed. Measured on the graph as it arrives: a graph cut down
 * first is measured as the smaller graph it is.
 */
export const measureNode: NodeKind = {
  name: "measure",
  title: "Measure",
  role: "statistic",
  shelf: "This site",
  summary: "One more column for every file: PageRank, bridges, reach, core, stack, closeness, clustering, group — or how often and how lately it changed.",
  inputs: [
    { name: "graph", label: "graph", type: "graph" },
    { name: "what", label: "what", type: "text", initial: "pagerank", editor: { kind: "choice", choices: Object.entries(MEASURES).map(([value, measure]) => ({ value, label: measure.label })) } },
  ],
  outputs: [{ name: "graph", label: "graph", type: "graph" }],
  run: (inputs) => {
    const graph = inputs["graph"] as CodeGraph;
    const what = String(inputs["what"]);
    const measure = MEASURES[what];
    if (!measure) throw new Error(`what: there is no measure ${what}: there are ${Object.keys(MEASURES).join(", ")}`);
    const column: Column = { name: what, kind: measure.kind ?? "number", about: measure.about };
    const values = new Map(graph.snapshot.modules.map((module) => [module.id, measure.of(graph).get(module.id) ?? null]));
    return { outputs: { graph: { ...graph, measured: [...graph.measured.filter((each) => each.column.name !== what), { column, values }] } satisfies CodeGraph }, said: `+ ${measure.label}` };
  },
};

import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { pickColumn } from "../../../platform/blueprint/pickColumn";
import { ROW_TESTS } from "../../../platform/blueprint/ROW_TESTS";
import type { CodeGraph } from "./CodeGraph";
import { graphTableOf } from "./graphTableOf";
import { subgraphOf } from "./subgraphOf";

/**
 * Only the files — or boxes — whose column is as asked, by any column the
 * graph has measured: the files changed ten times or more, the ones of one
 * group, the ones a hundred lines long. Kept as a graph, with the arrows
 * among them, so what is left can still be measured and drawn.
 */
export const keepFilesNode: NodeKind = {
  name: "keep-files",
  title: "Keep files",
  role: "step",
  shelf: "This site",
  summary: "Only the files whose column is as asked — changed ten times or more, of one group, needed by many — kept as a graph, to measure and draw.",
  inputs: [
    { name: "graph", label: "graph", type: "graph" },
    { name: "column", label: "column", type: "text", optional: true, editor: { kind: "column", of: "graph" } },
    { name: "is", label: "is", type: "text", initial: "at-least", editor: { kind: "choice", choices: Object.entries(ROW_TESTS).map(([value, test]) => ({ value, label: test.label })) } },
    { name: "value", label: "value", type: "text", initial: "", editor: { kind: "values", of: "graph", column: "column", test: "is" }, hint: "a number or a word; two, for between; several, for one of" },
  ],
  outputs: [{ name: "graph", label: "graph", type: "graph" }],
  run: (inputs) => {
    const graph = inputs["graph"] as CodeGraph;
    const table = graphTableOf(graph);
    const column = pickColumn(table, inputs["column"] as string | undefined, "column", { measured: true });
    const test = ROW_TESTS[String(inputs["is"])];
    if (!test) throw new Error(`is: there is no test ${String(inputs["is"])}: there are ${Object.keys(ROW_TESTS).join(", ")}`);
    const value = String(inputs["value"] ?? "");
    const key = table.columns[0]?.name ?? "file";
    const idOf = new Map(graph.snapshot.modules.map((module) => [module.path, module.id]));
    const keep = new Set(table.rows.filter((row) => test.test(row[column.name], value)).flatMap((row) => idOf.get(String(row[key])) ?? []));
    return { outputs: { graph: subgraphOf(graph, keep) }, said: `${keep.size} of ${graph.snapshot.modules.length} ${graph.of}`, settled: { column: column.name } };
  },
};

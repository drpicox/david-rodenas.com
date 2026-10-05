import type { Column, Row, Table } from "../../../platform/blueprint/Table";
import { boxOf } from "../boxOf";
import { dayOf } from "../dayOf";
import type { CodeGraph } from "./CodeGraph";
import { degreesOf } from "./degreesOf";

/**
 * A graph as the table of its nodes: a row a file — its path, its box, its
 * lines, whether it is a test — or a row a box, with how many files it holds;
 * then how many need it and how many it needs, and every column measured on
 * the way. What any table step, statistic or picture can take.
 */
export function graphTableOf(graph: CodeGraph): Table {
  const { snapshot } = graph;
  const { neededBy, needs } = degreesOf(snapshot);
  const boxes = graph.of === "boxes";
  const columns: Column[] = [
    boxes ? { name: "box", kind: "text", key: true } : { name: "file", kind: "text", key: true },
    ...(boxes ? [{ name: "files", kind: "number" as const }] : [{ name: "box", kind: "text" as const }]),
    { name: "lines", kind: "number" },
    ...(boxes ? [] : [{ name: "test", kind: "text" as const }]),
    { name: "needed", kind: "number", about: `the ${graph.of} that need it` },
    { name: "needs", kind: "number", about: `the ${graph.of} it needs` },
    ...graph.measured.map((each) => each.column),
  ];
  const rows = snapshot.modules.map(
    (module): Row => ({
      ...(boxes ? { box: module.path, files: graph.members?.get(module.id)?.length ?? 0 } : { file: module.path, box: boxOf(module.path) }),
      lines: module.lines,
      ...(!boxes && { test: module.test ? "yes" : "no" }),
      needed: neededBy.get(module.id) ?? 0,
      needs: needs.get(module.id) ?? 0,
      ...Object.fromEntries(graph.measured.map((each) => [each.column.name, each.values.get(module.id) ?? null])),
    }),
  );
  const commit = graph.read.history.commits[graph.at];
  return { columns, rows, credits: commit ? [{ said: `This site's source at commit ${commit.sha.slice(0, 7)}, of ${dayOf(commit)} ${commit.date.slice(0, 4)}.` }] : [] };
}

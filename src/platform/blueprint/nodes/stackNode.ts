import type { NodeKind } from "../NodeKind";
import type { Column, Table } from "../Table";
import { mergedCredits } from "./mergedCredits";

/** The rows of one table under the other's, with a column that says which each came from: two stations in one picture. */
export const stackNode: NodeKind = {
  name: "stack",
  title: "Stack",
  role: "step",
  shelf: "Tables",
  summary: "The rows of one table under the other's, with a column, from, that says which each came from.",
  inputs: [
    { name: "a", label: "first", type: "table" },
    { name: "b", label: "second", type: "table" },
    { name: "a-name", label: "first is", type: "text", initial: "first" },
    { name: "b-name", label: "second is", type: "text", initial: "second" },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const [a, b] = [inputs["a"] as Table, inputs["b"] as Table];
    const columns: Column[] = [{ name: "from", kind: "text", key: true }];
    for (const column of [...a.columns, ...b.columns]) if (!columns.some((each) => each.name === column.name)) columns.push(column);
    const fill = (table: Table, from: string) => table.rows.map((row) => Object.fromEntries(columns.map((column) => [column.name, column.name === "from" ? from : (row[column.name] ?? null)])));
    return { outputs: { table: { columns, rows: [...fill(a, String(inputs["a-name"])), ...fill(b, String(inputs["b-name"]))], credits: mergedCredits(a, b) } } };
  },
};

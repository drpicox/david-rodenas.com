import type { NodeKind } from "../NodeKind";
import { pickColumn } from "../pickColumn";
import type { Cell, Table } from "../Table";

/** Two cells in order: numbers as numbers, words as a dictionary has them, and nothing after everything. */
function inOrder(a: Cell | undefined, b: Cell | undefined): number {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : 1;
  if (b === null || b === undefined) return -1;
  return typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b));
}

/** The rows in the order of a column, rising or falling; what holds nothing goes last either way. */
export const sortNode: NodeKind = {
  name: "sort",
  title: "Sort",
  role: "step",
  shelf: "Tables",
  summary: "The rows in the order of a column, rising or falling.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "by", label: "by", type: "text", optional: true, editor: { kind: "column", of: "table" } },
    { name: "order", label: "order", type: "text", initial: "rising", editor: { kind: "choice", choices: [{ value: "rising", label: "rising" }, { value: "falling", label: "falling" }] } },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const by = pickColumn(table, inputs["by"] as string | undefined, "by");
    const sign = inputs["order"] === "falling" ? -1 : 1;
    const rows = [...table.rows].sort((a, b) => {
      const [x, y] = [a[by.name], b[by.name]];
      return x === null || x === undefined || y === null || y === undefined ? inOrder(x, y) : sign * inOrder(x, y);
    });
    return { outputs: { table: { ...table, rows } }, settled: { by: by.name } };
  },
};

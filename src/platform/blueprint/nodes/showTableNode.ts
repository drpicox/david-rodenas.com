import type { NodeKind } from "../NodeKind";
import { tableMarkup } from "../paint/tableMarkup";
import type { Table } from "../Table";
import { creditLines } from "./creditLines";

/** A table on the board, as a table: its first rows, every column. */
export const showTableNode: NodeKind = {
  name: "show-table",
  title: "Table",
  role: "paint",
  shelf: "Paint",
  summary: "A table on the board, as a table: its first rows, every column.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "rows", label: "rows shown", type: "number", initial: 12, editor: { kind: "number", min: 1, max: 200, step: 1 } },
  ],
  outputs: [],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const most = Math.max(1, Math.round(Number(inputs["rows"])));
    return { painting: { html: tableMarkup(table, most).html, caption: `${table.rows.length} rows of ${table.columns.map((column) => column.name).join(", ")}`, credits: creditLines(table) } };
  },
};

import type { NodeKind } from "../NodeKind";
import { numberSaid } from "../numberSaid";
import { pickColumn } from "../pickColumn";
import { summaryOf } from "../summaryOf";
import type { Table } from "../Table";

const FIGURES = [
  ["mean", "mean"],
  ["median", "median"],
  ["lowest", "lowest"],
  ["highest", "highest"],
  ["deviation", "deviation"],
  ["count", "count"],
] as const;

/** A column in a few figures: its mean, its middle, both ends, how spread it is, how many; each a number to wire on, and all of them as a table. */
export const summaryNode: NodeKind = {
  name: "summary",
  title: "Sum up",
  role: "statistic",
  shelf: "Statistics",
  summary: "A column in a few figures: the mean, the median, the lowest and highest, the standard deviation, and how many.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "column", label: "column", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
  ],
  outputs: [...FIGURES.map(([name, label]) => ({ name, label, type: "number" })), { name: "table", label: "as a table", type: "table" }],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const column = pickColumn(table, inputs["column"] as string | undefined, "column", { numeric: true, measured: true });
    const summary = summaryOf(table.rows.map((row) => row[column.name]).filter((cell): cell is number => typeof cell === "number"));
    const figures: Table = {
      columns: [{ name: "figure", kind: "text", key: true }, { name: column.name, kind: "number", ...(column.unit && { unit: column.unit }) }],
      rows: FIGURES.map(([name]) => ({ figure: name, [column.name]: Number.isFinite(summary[name]) ? summary[name] : null })),
      ...(table.credits && { credits: table.credits }),
    };
    return { outputs: { ...summary, table: figures }, said: `mean ${numberSaid(summary.mean)}${column.unit ? ` ${column.unit}` : ""} of ${summary.count}`, settled: { column: column.name } };
  },
};

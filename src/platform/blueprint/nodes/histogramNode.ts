import type { NodeKind } from "../NodeKind";
import { pickColumn } from "../pickColumn";
import { scaleOf } from "../paint/scaleOf";
import type { Table } from "../Table";

/** How a column's values are spread: the range cut into bins of round edges, and how many values fall in each. */
export const histogramNode: NodeKind = {
  name: "histogram",
  title: "Histogram",
  role: "statistic",
  shelf: "Statistics",
  summary: "How a column's values are spread: its range cut into bins with round edges, and how many values fall in each.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "column", label: "column", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "bins", label: "about how many bins", type: "number", initial: 12, editor: { kind: "number", min: 2, max: 60, step: 1 } },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const column = pickColumn(table, inputs["column"] as string | undefined, "column", { numeric: true, measured: true });
    const values = table.rows.map((row) => row[column.name]).filter((cell): cell is number => typeof cell === "number");
    if (values.length === 0) throw new Error(`${column.name} holds no numbers to spread`);
    const { ticks } = scaleOf(values, { count: Math.max(2, Math.round(Number(inputs["bins"]))) });
    const edges = ticks.length > 1 ? ticks : [ticks[0] ?? 0, (ticks[0] ?? 0) + 1];
    const rows = edges.slice(0, -1).map((from, at) => {
      const to = edges[at + 1] ?? from;
      const last = at === edges.length - 2;
      return { from, to, count: values.filter((value) => value >= from && (value < to || (last && value <= to))).length };
    });
    return {
      outputs: { table: { columns: [{ name: "from", kind: "number", key: true, ...(column.unit && { unit: column.unit }) }, { name: "to", kind: "number", key: true }, { name: "count", kind: "number" }], rows, ...(table.credits && { credits: table.credits }) } },
      said: `${rows.length} bins of ${values.length} values`,
      settled: { column: column.name },
    };
  },
};

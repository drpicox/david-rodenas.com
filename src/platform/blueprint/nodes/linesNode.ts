import type { NodeKind } from "../NodeKind";
import { linePlot } from "../paint/linePlot";
import { pickColumn } from "../pickColumn";
import type { Table } from "../Table";
import { cellLabel } from "./cellLabel";
import { creditLines } from "./creditLines";
import { numericPairs } from "./numericPairs";

/** A line along a column of numbers — two, given another column — or one for each value of a column it is split by: NO2 by year, a line a station. */
export const linesNode: NodeKind = {
  name: "lines",
  title: "Lines",
  role: "paint",
  shelf: "Paint",
  summary: "A line of one column along another — and of a second, given one — or a line for each value of a third: NO2 by year, a line a station.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "x", label: "along", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "y", label: "of", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "and", label: "and of", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "split", label: "a line for each", type: "text", optional: true, editor: { kind: "column", of: "table" } },
  ],
  outputs: [],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const x = pickColumn(table, inputs["x"] as string | undefined, "along", { numeric: true });
    const y = pickColumn(table, inputs["y"] as string | undefined, "of", { numeric: true, measured: true, besides: [x.name] });
    const split = inputs["split"] ? pickColumn(table, inputs["split"] as string, "a line for each") : undefined;
    const and = inputs["and"] && !split ? pickColumn(table, inputs["and"] as string, "and of", { numeric: true }) : undefined;
    const lineOf = (name: string, rows: Table["rows"], column: string) => {
      const { xs, ys } = numericPairs({ ...table, rows }, x.name, column);
      return { name, points: xs.map((px, at) => [px, ys[at] ?? 0] as const).sort((a, b) => a[0] - b[0]) };
    };
    const series = split
      ? [...new Set(table.rows.map((row) => cellLabel(row[split.name])))].map((name) => lineOf(name, table.rows.filter((row) => cellLabel(row[split.name]) === name), y.name))
      : [lineOf(y.name, table.rows, y.name), ...(and ? [lineOf(and.name, table.rows, and.name)] : [])];
    // Two columns on one axis are named by the legend: the axis says only what they are counted in.
    const html = linePlot({ series, x: x.name, y: and ? (y.unit ?? "") : y.name, ...(y.unit && !and && { unit: y.unit }) }).html;
    return { painting: { html, caption: `${y.name}${and ? ` and ${and.name}` : ""} along ${x.name}${split ? `, a line for each ${split.name}` : ""}`, credits: creditLines(table) }, settled: { x: x.name, y: y.name } };
  },
};

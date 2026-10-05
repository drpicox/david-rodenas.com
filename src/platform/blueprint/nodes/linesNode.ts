import type { NodeKind } from "../NodeKind";
import { linePlot } from "../paint/linePlot";
import { pickColumn } from "../pickColumn";
import type { Table } from "../Table";
import { cellLabel } from "./cellLabel";
import { creditLines } from "./creditLines";
import { numericPairs } from "./numericPairs";

/** A line along a column of numbers, one for each value of another column when it is split: NO2 by year, a line a station. */
export const linesNode: NodeKind = {
  name: "lines",
  title: "Lines",
  role: "paint",
  shelf: "Paint",
  summary: "A line of one column along another, or one line for each value of a third: NO2 by year, a line a station.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "x", label: "along", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "y", label: "of", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "split", label: "a line for each", type: "text", optional: true, editor: { kind: "column", of: "table" } },
  ],
  outputs: [],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const x = pickColumn(table, inputs["x"] as string | undefined, "along", { numeric: true });
    const y = pickColumn(table, inputs["y"] as string | undefined, "of", { numeric: true, measured: true, besides: [x.name] });
    const split = inputs["split"] ? pickColumn(table, inputs["split"] as string, "a line for each") : undefined;
    const names = split ? [...new Set(table.rows.map((row) => cellLabel(row[split.name])))] : [y.name];
    const series = names.map((name) => {
      const rows = split ? table.rows.filter((row) => cellLabel(row[split.name]) === name) : table.rows;
      const { xs, ys } = numericPairs({ ...table, rows }, x.name, y.name);
      const points = xs.map((px, at) => [px, ys[at] ?? 0] as const).sort((a, b) => a[0] - b[0]);
      return { name, points };
    });
    const html = linePlot({ series, x: x.name, y: y.name, ...(y.unit && { unit: y.unit }) }).html;
    return { painting: { html, caption: `${y.name} along ${x.name}${split ? `, a line for each ${split.name}` : ""}`, credits: creditLines(table) }, settled: { x: x.name, y: y.name } };
  },
};

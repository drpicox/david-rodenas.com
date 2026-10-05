import type { NodeKind } from "../NodeKind";
import { heatPlot } from "../paint/heatPlot";
import { pickColumn } from "../pickColumn";
import type { Cell, Table } from "../Table";
import { cellLabel } from "./cellLabel";
import { creditLines } from "./creditLines";

/** The distinct values of a column, in order: numbers rising, words as they first came. */
function distinct(table: Table, name: string): Cell[] {
  const values = [...new Set(table.rows.map((row) => row[name] ?? null))];
  return values.every((value) => typeof value === "number") ? (values as number[]).sort((a, b) => a - b) : values;
}

/** A grid of cells, one column of it for each value of x and a row for each of y, each as deep as a third: the hour against the month. */
export const heatmapNode: NodeKind = {
  name: "heatmap",
  title: "Heat map",
  role: "paint",
  shelf: "Paint",
  summary: "A grid, a column of cells for each value of x and a row for each of y, each as deep as a third column: the hour of the day against the month.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "x", label: "across", type: "text", optional: true, editor: { kind: "column", of: "table" } },
    { name: "y", label: "down", type: "text", optional: true, editor: { kind: "column", of: "table" } },
    { name: "value", label: "as deep as", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
  ],
  outputs: [],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const x = pickColumn(table, inputs["x"] as string | undefined, "across");
    const y = pickColumn(table, inputs["y"] as string | undefined, "down", { besides: [x.name] });
    const value = pickColumn(table, inputs["value"] as string | undefined, "as deep as", { numeric: true, measured: true, besides: [x.name, y.name] });
    const [xs, ys] = [distinct(table, x.name), distinct(table, y.name)];
    if (xs.length * ys.length > 6000) throw new Error(`${xs.length} by ${ys.length} cells are too many to see: group the rows first`);
    const sums = new Map<string, { sum: number; count: number }>();
    for (const row of table.rows) {
      const cell = row[value.name];
      if (typeof cell !== "number") continue;
      const key = `${xs.indexOf(row[x.name] ?? null)}:${ys.indexOf(row[y.name] ?? null)}`;
      const kept = sums.get(key) ?? { sum: 0, count: 0 };
      sums.set(key, { sum: kept.sum + cell, count: kept.count + 1 });
    }
    const values = new Map([...sums].map(([key, { sum, count }]) => [key, sum / count]));
    const html = heatPlot({ xs: xs.map(cellLabel), ys: ys.map(cellLabel), values, x: x.name, y: y.name, ...(value.unit && { unit: value.unit }) }).html;
    return { painting: { html, caption: `${value.name} by ${x.name} and ${y.name}`, credits: creditLines(table) }, settled: { x: x.name, y: y.name, value: value.name } };
  },
};

import type { NodeKind } from "../NodeKind";
import { barPlot } from "../paint/barPlot";
import { pickColumn } from "../pickColumn";
import type { Table } from "../Table";
import { cellLabel } from "./cellLabel";
import { creditLines } from "./creditLines";

/** More bars than this are a smear, not a picture: group the rows, or keep the top ones, first. */
const MOST = 240;
const faint = (cell: unknown) => cell === 0 || cell === false || cell === "no" || cell === null;

/** A bar a row, standing on zero, as tall as a column: nights a year, files a box. */
export const barsNode: NodeKind = {
  name: "bars",
  title: "Bars",
  role: "paint",
  shelf: "Paint",
  summary: "A bar a row, as tall as a column: the nights of each year, the files of each box.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "x", label: "x", type: "text", optional: true, editor: { kind: "column", of: "table" } },
    { name: "y", label: "height", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "faded", label: "faint unless", type: "text", optional: true, editor: { kind: "column", of: "table" }, hint: "a column that says no, or 0, for the rows to draw faint: a year not measured whole" },
  ],
  outputs: [],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const x = pickColumn(table, inputs["x"] as string | undefined, "x");
    const y = pickColumn(table, inputs["y"] as string | undefined, "height", { numeric: true, measured: true, besides: [x.name] });
    if (table.rows.length > MOST) throw new Error(`${table.rows.length} rows would be ${table.rows.length} bars: group them, or keep the top ones, first`);
    const faded = inputs["faded"] ? pickColumn(table, inputs["faded"] as string, "faint unless") : undefined;
    const html = barPlot({
      categories: table.rows.map((row) => cellLabel(row[x.name])),
      values: table.rows.map((row) => (typeof row[y.name] === "number" ? (row[y.name] as number) : null)),
      faded: table.rows.map((row) => (faded ? faint(row[faded.name]) : false)),
      x: x.name,
      y: y.name,
      ...(y.unit && { unit: y.unit }),
    }).html;
    return { painting: { html, caption: `${y.name} by ${x.name}, ${table.rows.length} bars`, credits: creditLines(table) }, settled: { x: x.name, y: y.name } };
  },
};

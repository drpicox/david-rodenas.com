import { fitOf } from "../fitOf";
import type { NodeKind } from "../NodeKind";
import { numberSaid } from "../numberSaid";
import { scatterPlot } from "../paint/scatterPlot";
import { pickColumn } from "../pickColumn";
import type { Table } from "../Table";
import { cellLabel } from "./cellLabel";
import { inOrderOf } from "./inOrderOf";
import { creditLines } from "./creditLines";
import { numericPairs } from "./numericPairs";

/** Beyond this many dots, a picture is only ink. */
const MOST = 5000;

/** Two columns against each other, a dot a row, coloured by a third, with the straight line fitted through them: what goes with what. */
export const scatterNode: NodeKind = {
  name: "scatter",
  title: "Scatter",
  role: "paint",
  shelf: "Paint",
  summary: "Two columns against each other, a dot a row, with the line fitted through them: what goes with what.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "x", label: "x", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "y", label: "y", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "colour", label: "coloured by", type: "text", optional: true, editor: { kind: "column", of: "table" } },
    { name: "label", label: "named by", type: "text", optional: true, editor: { kind: "column", of: "table" } },
    { name: "fit", label: "fitted line", type: "flag", initial: true, editor: { kind: "flag" } },
  ],
  outputs: [],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const x = pickColumn(table, inputs["x"] as string | undefined, "x", { numeric: true, measured: true });
    const y = pickColumn(table, inputs["y"] as string | undefined, "y", { numeric: true, measured: true, besides: [x.name] });
    const colour = inputs["colour"] ? pickColumn(table, inputs["colour"] as string, "coloured by") : undefined;
    const label = inputs["label"] ? pickColumn(table, inputs["label"] as string, "named by") : undefined;
    const { xs, ys, rows } = numericPairs(table, x.name, y.name);
    if (rows.length > MOST) throw new Error(`${rows.length} dots are too many to see: keep some rows first`);
    const groups = colour ? inOrderOf(colour, rows.map((row) => cellLabel(row[colour.name]))) : [];
    const points = rows.map((row, at) => ({
      x: xs[at] ?? 0,
      y: ys[at] ?? 0,
      key: label ? cellLabel(row[label.name]) : String(at),
      ...(label && { label: cellLabel(row[label.name]) }),
      ...(colour && { group: groups.indexOf(cellLabel(row[colour.name])) }),
    }));
    const fit = fitOf(xs, ys);
    const fitted = inputs["fit"] === true && Number.isFinite(fit.slope);
    const html = scatterPlot({ points, groups, x: `${x.name}${x.unit ? ` (${x.unit})` : ""}`, y: `${y.name}${y.unit ? ` (${y.unit})` : ""}`, ...(fitted && { fit }) }).html;
    const caption = `${y.name} against ${x.name}, ${points.length} rows${Number.isFinite(fit.r) ? `, r = ${numberSaid(fit.r)}` : ""}`;
    return { painting: { html, caption, credits: creditLines(table) }, settled: { x: x.name, y: y.name } };
  },
};

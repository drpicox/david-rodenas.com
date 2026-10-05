import { fitOf } from "../fitOf";
import type { NodeKind } from "../NodeKind";
import { numberSaid } from "../numberSaid";
import { pickColumn } from "../pickColumn";
import type { Table } from "../Table";
import { numericPairs } from "./numericPairs";

const signed = (value: number) => `${value > 0 ? "+" : ""}${numberSaid(value)}`;

/**
 * Which way a column goes along another — most often along the years — as
 * the slope of the straight line fitted through it: how much it changes for
 * each one of x, and for each ten, which over years is a decade. A slope is
 * a summary of a cloud of points, not a promise about the next one.
 */
export const trendNode: NodeKind = {
  name: "trend",
  title: "Trend",
  role: "statistic",
  shelf: "Statistics",
  summary: "Which way a column goes along another, most often the years: the slope of the line fitted through it, a step and ten steps of x.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "x", label: "along", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "y", label: "of", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
  ],
  outputs: [
    { name: "per-ten", label: "for each ten", type: "number" },
    { name: "slope", label: "for each one", type: "number" },
    { name: "change", label: "over it all", type: "number" },
  ],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const x = pickColumn(table, (inputs["x"] as string | undefined) ?? (table.columns.some((column) => column.name === "year") ? "year" : undefined), "along", { numeric: true });
    const y = pickColumn(table, inputs["y"] as string | undefined, "of", { numeric: true, measured: true, besides: [x.name] });
    const { xs, ys } = numericPairs(table, x.name, y.name);
    const fit = fitOf(xs, ys);
    if (!Number.isFinite(fit.slope)) throw new Error(`a trend needs at least two different ${x.name}s with a ${y.name}`);
    const perTen = fit.slope * 10;
    const unit = y.unit ? ` ${y.unit}` : "";
    const said = x.name === "year" ? `${signed(perTen)}${unit} a decade` : `${signed(perTen)}${unit} for each ten of ${x.name}`;
    return { outputs: { "per-ten": perTen, slope: fit.slope, change: fit.slope * (Math.max(...xs) - Math.min(...xs)) }, said, settled: { x: x.name, y: y.name } };
  },
};

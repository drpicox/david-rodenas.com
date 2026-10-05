import { fitOf } from "../fitOf";
import type { NodeKind } from "../NodeKind";
import { numberSaid } from "../numberSaid";
import { pickColumn } from "../pickColumn";
import { ranked } from "../ranked";
import type { Table } from "../Table";
import { numericPairs } from "./numericPairs";

/**
 * How nearly two columns rise and fall together, from −1 to 1: Pearson's r
 * of the values, or Spearman's, of their ranks, which only asks whether more
 * of one goes with more of the other. Two things that go together need not
 * be cause and effect: both may follow a third — the season, say.
 */
export const correlationNode: NodeKind = {
  name: "correlation",
  title: "Correlation",
  role: "statistic",
  shelf: "Statistics",
  summary: "How nearly two columns rise and fall together, from −1 to 1, over the rows that have both: Pearson's r, or Spearman's, of the ranks.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "x", label: "x", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "y", label: "y", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "of", label: "of", type: "text", initial: "values", editor: { kind: "choice", choices: [{ value: "values", label: "the values (Pearson)" }, { value: "ranks", label: "the ranks (Spearman)" }] } },
  ],
  outputs: [
    { name: "r", label: "r", type: "number" },
    { name: "n", label: "rows", type: "number" },
    { name: "slope", label: "slope", type: "number" },
    { name: "intercept", label: "intercept", type: "number" },
  ],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const x = pickColumn(table, inputs["x"] as string | undefined, "x", { numeric: true, measured: true });
    const y = pickColumn(table, inputs["y"] as string | undefined, "y", { numeric: true, measured: true, besides: [x.name] });
    const { xs, ys } = numericPairs(table, x.name, y.name);
    // Two points always lie on a line: a correlation of them says nothing.
    if (xs.length < 3) throw new Error(`only ${xs.length} rows have both ${x.name} and ${y.name}`);
    const fit = fitOf(xs, ys);
    const r = inputs["of"] === "ranks" ? fitOf(ranked(xs), ranked(ys)).r : fit.r;
    if (!Number.isFinite(r)) throw new Error(`${Number.isFinite(fit.slope) ? y.name : x.name} never changes, so nothing can go with it`);
    return { outputs: { r, n: fit.n, slope: fit.slope, intercept: fit.intercept }, said: `r = ${numberSaid(r)} over ${fit.n} rows`, settled: { x: x.name, y: y.name } };
  },
};

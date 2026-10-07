import type { NodeKind, Ran } from "../../../platform/blueprint/NodeKind";
import { correlationNode } from "../../../platform/blueprint/nodes/correlationNode";
import { joinNode } from "../../../platform/blueprint/nodes/joinNode";
import { keepNode } from "../../../platform/blueprint/nodes/keepNode";
import { scatterNode } from "../../../platform/blueprint/nodes/scatterNode";
import { seasonNode } from "../../../platform/blueprint/nodes/seasonNode";
import { pickColumn } from "../../../platform/blueprint/pickColumn";
import type { Table } from "../../../platform/blueprint/Table";

const tableOf = (ran: Ran) => ran.outputs?.["table"] as Table;
const keyed = (table: Table, name: string) => table.columns.some((column) => column.name === name && column.key);

/**
 * On trial: what the examples that cross the weather and the air do in six
 * small nodes, in one. The two tables joined on the keys they share, kept to
 * what was measured whole, the season taken out — and the years — when they
 * are months of years, and a column of one against a column of the other:
 * their correlation, and a scatter. It runs the small nodes themselves, one
 * after another, so it says what they would.
 */
export const crossNode: NodeKind = {
  name: "cross",
  title: "Cross two sources",
  role: "paint",
  shelf: "Recipes",
  flag: "recipes",
  summary: "Two tables in one node: joined on the keys they share, kept to what was measured whole, the season and the years taken out if asked, and a column of one against a column of the other — their correlation, and a scatter.",
  inputs: [
    { name: "left", label: "one", type: "table" },
    { name: "right", label: "the other", type: "table" },
    { name: "x", label: "x, of the one", type: "text", optional: true, editor: { kind: "column", of: "left", numeric: true } },
    { name: "y", label: "y, of the other", type: "text", optional: true, editor: { kind: "column", of: "right", numeric: true } },
    {
      name: "out",
      label: "taking out",
      type: "text",
      initial: "both",
      editor: {
        kind: "choice",
        choices: [
          { value: "nothing", label: "nothing" },
          { value: "season", label: "the season" },
          { value: "both", label: "the season and the years" },
        ],
      },
    },
  ],
  outputs: [
    { name: "r", label: "r", type: "number" },
    { name: "table", label: "what is left", type: "table" },
  ],
  run: (inputs, context) => {
    const [left, right] = [inputs["left"] as Table, inputs["right"] as Table];
    const x = pickColumn(left, inputs["x"] as string | undefined, "x, of the one", { numeric: true, measured: true });
    const y = pickColumn(right, inputs["y"] as string | undefined, "y, of the other", { numeric: true, measured: true });
    const join = joinNode.run({ left, right }, context);
    const joined = tableOf(join);
    // The join renames a column of the other that the one has already, as it would by hand — tx beside tx is tx2 — so the other's is found where it went.
    const on = String(join.settled?.["on"] ?? "").split(" ");
    const theirs = right.columns.filter((column) => !on.includes(column.name)).findIndex((column) => column.name === y.name);
    const yName = joined.columns[left.columns.length + theirs]?.name ?? y.name;
    const whole = joined.columns.some((column) => column.name === "whole") ? tableOf(keepNode.run({ table: joined, column: "whole", is: "equals", value: "yes" }, context)) : joined;
    const out = String(inputs["out"] ?? "both");
    const monthly = keyed(whole, "year") && keyed(whole, "month");
    const seasonless = monthly && out !== "nothing" ? tableOf(seasonNode.run({ table: whole, by: "month" }, context)) : whole;
    const left2 = monthly && out === "both" ? tableOf(seasonNode.run({ table: seasonless, by: "year" }, context)) : seasonless;
    const pair = { table: left2, x: x.name, y: yName };
    const correlation = correlationNode.run({ ...pair, of: "values" }, context);
    const scatter = scatterNode.run({ ...pair, ...(left2.columns.some((column) => column.name === "season") && { colour: "season" }), fit: true }, context);
    return { outputs: { r: correlation.outputs?.["r"], table: left2 }, ...(scatter.painting && { painting: scatter.painting }), ...(correlation.said && { said: correlation.said }), settled: { x: x.name, y: y.name } };
  },
};

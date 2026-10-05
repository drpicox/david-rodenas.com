import type { NodeKind } from "../NodeKind";
import type { Column, Row, Table } from "../Table";
import { mergedCredits } from "./mergedCredits";

/** The columns two tables are joined on when none are named: the keys both have — a year, a month — or, if neither marks keys, every column both have. */
function sharedKeys(left: Table, right: Table): string[] {
  const theirs = new Map(right.columns.map((column) => [column.name, column]));
  const shared = left.columns.filter((column) => theirs.has(column.name));
  const keys = shared.filter((column) => column.key && theirs.get(column.name)?.key);
  return (keys.length > 0 ? keys : shared).map((column) => column.name);
}

/**
 * Two tables side by side: a row for each pair of rows, one from each, that
 * agree on the columns joined on — a month at the weather station and the
 * same month at the measuring point. Rows that find no partner are left out.
 * A column both have, besides those joined on, is kept twice, the second
 * renamed with a 2.
 */
export const joinNode: NodeKind = {
  name: "join",
  title: "Join",
  role: "step",
  shelf: "Tables",
  summary: "Two tables side by side, a row for each pair of rows that agree on the columns joined on: the same year and month in both.",
  inputs: [
    { name: "left", label: "left", type: "table" },
    { name: "right", label: "right", type: "table" },
    { name: "on", label: "on", type: "text", optional: true, hint: "the names of the columns to match, as: year month; the keys both have when left empty" },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const [left, right] = [inputs["left"] as Table, inputs["right"] as Table];
    const named = String(inputs["on"] ?? "").split(/[\s,]+/).filter(Boolean);
    const on = named.length > 0 ? named : sharedKeys(left, right);
    if (on.length === 0) throw new Error("on: the two tables have no column in common to join on");
    for (const [table, side] of [[left, "left"], [right, "right"]] as const) {
      const missing = on.find((name) => !table.columns.some((column) => column.name === name));
      if (missing) throw new Error(`on: the ${side} table has no column ${missing}`);
    }
    const taken = new Set(left.columns.map((column) => column.name));
    const renamed = new Map<string, string>();
    const added: Column[] = [];
    for (const column of right.columns.filter((each) => !on.includes(each.name))) {
      let name = column.name;
      for (let count = 2; taken.has(name); count += 1) name = `${column.name}${count}`;
      taken.add(name);
      renamed.set(column.name, name);
      added.push({ ...column, name });
    }
    const keyOf = (row: Row) => JSON.stringify(on.map((name) => row[name] ?? null));
    const partners = new Map<string, Row[]>();
    for (const row of right.rows) partners.set(keyOf(row), [...(partners.get(keyOf(row)) ?? []), row]);
    const rows = left.rows.flatMap((row) => (partners.get(keyOf(row)) ?? []).map((partner): Row => ({ ...row, ...Object.fromEntries([...renamed].map(([from, to]) => [to, partner[from] ?? null])) })));
    return {
      outputs: { table: { columns: [...left.columns, ...added], rows, credits: mergedCredits(left, right) } },
      said: `${rows.length} rows matched, of ${left.rows.length} and ${right.rows.length}`,
      settled: { on: on.join(" ") },
    };
  },
};

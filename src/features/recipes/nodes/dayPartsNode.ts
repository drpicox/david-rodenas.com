import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { pickColumn } from "../../../platform/blueprint/pickColumn";
import type { Column, Row, Table } from "../../../platform/blueprint/Table";

/** Two hours written as one input, as 13 16: from the one to the other, both in. */
function hoursOf(written: unknown, input: string): readonly [number, number] {
  const [from, to] = String(written ?? "").split(/[\s,–-]+/).filter(Boolean).map(Number);
  if (from === undefined || to === undefined || !Number.isFinite(from) || !Number.isFinite(to)) throw new Error(`${input}: two hours, as 13 16`);
  return [Math.min(from, to), Math.max(from, to)];
}

/**
 * On trial: what the evening example does in seven small nodes — two
 * filters of hours, two groups, a join and a formula — in one. For every day
 * the hours make up, which is every row the other keys tell apart — a month
 * of a year — the mean of the first hours and of the second, and how much
 * the second rose over the first.
 */
export const dayPartsNode: NodeKind = {
  name: "day-parts",
  title: "Two times of day",
  role: "step",
  shelf: "Recipes",
  flag: "recipes",
  summary: "Two times of a day compared in one node: for every day the hours make up — a month of a year — the mean of the first hours and of the second, and how much the second rose over the first.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "value", label: "of", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "first", label: "first, hours", type: "text", initial: "13 16", hint: "two hours, as 13 16: from the one to the other, both in" },
    { name: "second", label: "then, hours", type: "text", initial: "19 22", hint: "two hours, as 19 22" },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const hour = pickColumn(table, "hour", "hours");
    const value = pickColumn(table, inputs["value"] as string | undefined, "of", { numeric: true, measured: true, besides: [hour.name] });
    const [early, late] = [hoursOf(inputs["first"], "first, hours"), hoursOf(inputs["second"], "then, hours")];
    const keys = table.columns.filter((column) => column.key && column.name !== hour.name);
    const days = new Map<string, Row[]>();
    for (const row of table.rows) {
      const day = JSON.stringify(keys.map((column) => row[column.name] ?? null));
      days.set(day, [...(days.get(day) ?? []), row]);
    }
    const meanIn = (rows: readonly Row[], [from, to]: readonly [number, number]) => {
      const values = rows.filter((row) => Number(row[hour.name]) >= from && Number(row[hour.name]) <= to).flatMap((row) => (typeof row[value.name] === "number" ? [row[value.name] as number] : []));
      return values.length > 0 ? values.reduce((sum, each) => sum + each, 0) / values.length : null;
    };
    const rows = [...days.values()].map((members): Row => {
      const [first, second] = [meanIn(members, early), meanIn(members, late)];
      return { ...Object.fromEntries(keys.map((column) => [column.name, members[0]?.[column.name] ?? null])), early: first, late: second, rise: first === null || second === null ? null : second - first };
    });
    const unit = value.unit === undefined ? {} : { unit: value.unit };
    const columns: Column[] = [
      ...keys,
      { name: "early", kind: "number", ...unit, about: `the mean of ${value.name}, hours ${early[0]} to ${early[1]}` },
      { name: "late", kind: "number", ...unit, about: `the mean of ${value.name}, hours ${late[0]} to ${late[1]}` },
      { name: "rise", kind: "number", ...unit, about: "the later less the earlier" },
    ];
    return { outputs: { table: { columns, rows, credits: table.credits } }, said: `${rows.length} rows: hours ${early.join("–")} against ${late.join("–")}`, settled: { value: value.name } };
  },
};

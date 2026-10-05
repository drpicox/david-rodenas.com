import type { NodeKind } from "../NodeKind";
import { pickColumn } from "../pickColumn";
import { summaryOf } from "../summaryOf";
import type { Cell, Column, Row, Table } from "../Table";

const HOW: Readonly<Record<string, (values: readonly number[]) => number>> = {
  mean: (values) => summaryOf(values).mean,
  sum: (values) => values.reduce((a, b) => a + b, 0),
  median: (values) => summaryOf(values).median,
  lowest: (values) => summaryOf(values).lowest,
  highest: (values) => summaryOf(values).highest,
};

const cellOrder = (a: Cell | undefined, b: Cell | undefined) => (typeof a === "number" && typeof b === "number" ? a - b : String(a ?? "").localeCompare(String(b ?? "")));

/**
 * One row a group of rows that share a column — or two — with a column of
 * theirs summed up: the mean of each year, the total of each month, the
 * highest at each station. What holds nothing is left out of the sum, and a
 * group with nothing to sum holds nothing. How many rows each had is kept.
 */
export const groupNode: NodeKind = {
  name: "group",
  title: "Group",
  role: "step",
  shelf: "Tables",
  summary: "One row a group of rows that share a column, with another column summed up: the mean of each year, the total of each month.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "by", label: "by", type: "text", optional: true, editor: { kind: "column", of: "table" } },
    { name: "and", label: "and by", type: "text", optional: true, editor: { kind: "column", of: "table" } },
    { name: "value", label: "summing up", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "how", label: "as its", type: "text", initial: "mean", editor: { kind: "choice", choices: [...Object.keys(HOW), "count"].map((how) => ({ value: how, label: how })) } },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const by = pickColumn(table, inputs["by"] as string | undefined, "by");
    const and = inputs["and"] ? pickColumn(table, inputs["and"] as string, "and by") : undefined;
    const how = String(inputs["how"]);
    const counting = how === "count";
    const value = counting ? undefined : pickColumn(table, inputs["value"] as string | undefined, "summing up", { numeric: true, measured: true, besides: [by.name, and?.name ?? ""] });
    const sum = HOW[how];
    if (!counting && !sum) throw new Error(`as its: there is no ${how}: there are ${[...Object.keys(HOW), "count"].join(", ")}`);
    const keys = [by, ...(and ? [and] : [])];
    const groups = new Map<string, Row[]>();
    for (const row of table.rows) {
      const key = JSON.stringify(keys.map((column) => row[column.name] ?? null));
      groups.set(key, [...(groups.get(key) ?? []), row]);
    }
    const rows = [...groups.values()]
      .map((members): Row => {
        const first = members[0] ?? {};
        const values = value ? members.map((row) => row[value.name]).filter((cell): cell is number => typeof cell === "number") : [];
        const summed = value && sum ? { [value.name]: values.length > 0 ? sum(values) : null } : {};
        return { ...Object.fromEntries(keys.map((column) => [column.name, first[column.name] ?? null])), ...summed, rows: members.length };
      })
      .sort((a, b) => keys.reduce((order, column) => order || cellOrder(a[column.name], b[column.name]), 0));
    const columns: Column[] = [...keys.map((column) => ({ ...column, key: true })), ...(value ? [{ ...value, key: false, about: `the ${how} of ${value.name}` }] : []), { name: "rows", kind: "number", key: false }];
    return { outputs: { table: { ...table, columns: columns.map(({ key, ...rest }) => (key ? { ...rest, key } : rest)), rows } }, settled: { by: by.name, ...(value && { value: value.name }) } };
  },
};

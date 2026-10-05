import type { NodeKind } from "../NodeKind";
import { pickColumn } from "../pickColumn";
import type { Row, Table } from "../Table";

/**
 * Each value less the mean of the values that share its month — or whatever
 * column says which part of the year a row is — so that what is left is how
 * unusual it was for its time of year. Two things that both follow the
 * seasons go together whether or not either has anything to do with the
 * other; with the season taken out, what still goes together is what the
 * season does not explain.
 */
export const seasonNode: NodeKind = {
  name: "season",
  title: "Take the season out",
  role: "step",
  shelf: "Tables",
  summary: "Each value less the mean of its month, so what is left is how unusual it was for the time of year.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "column", label: "column", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true }, hint: "left empty, every column of what was measured" },
    { name: "by", label: "by", type: "text", initial: "month", editor: { kind: "column", of: "table" } },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const by = pickColumn(table, inputs["by"] as string | undefined, "by");
    const named = inputs["column"] ? [pickColumn(table, inputs["column"] as string, "column", { numeric: true })] : table.columns.filter((column) => column.kind === "number" && !column.key && column.name !== by.name);
    const names = new Set(named.map((column) => column.name));
    const means = new Map(
      named.map((column) => {
        const sums = new Map<unknown, { sum: number; count: number }>();
        for (const row of table.rows) {
          const value = row[column.name];
          if (typeof value !== "number") continue;
          const kept = sums.get(row[by.name]) ?? { sum: 0, count: 0 };
          sums.set(row[by.name], { sum: kept.sum + value, count: kept.count + 1 });
        }
        return [column.name, new Map([...sums].map(([part, { sum, count }]) => [part, sum / count]))];
      }),
    );
    const rows = table.rows.map((row): Row => ({
      ...row,
      ...Object.fromEntries(
        [...names].map((name) => {
          const value = row[name];
          const mean = means.get(name)?.get(row[by.name]);
          return [name, typeof value === "number" && mean !== undefined ? Math.round((value - mean) * 1e9) / 1e9 : null];
        }),
      ),
    }));
    const columns = table.columns.map((column) => (names.has(column.name) ? { ...column, about: `${column.name} less its ${by.name}'s mean` } : column));
    return { outputs: { table: { ...table, columns, rows } }, settled: { by: by.name } };
  },
};

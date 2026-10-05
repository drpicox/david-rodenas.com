import type { Table } from "../Table";

/** The rows where both columns hold a number, as two lists of the same length, with the row each pair came from. */
export function numericPairs(table: Table, x: string, y: string): { xs: number[]; ys: number[]; rows: Table["rows"][number][] } {
  const rows = table.rows.filter((row) => typeof row[x] === "number" && typeof row[y] === "number");
  return { xs: rows.map((row) => row[x] as number), ys: rows.map((row) => row[y] as number), rows };
}

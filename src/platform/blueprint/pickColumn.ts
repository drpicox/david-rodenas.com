import type { Column, Table } from "./Table";

export interface ColumnWanted {
  /** Only a column of numbers will do. */
  readonly numeric?: boolean;
  /** Columns another input of the node took already. */
  readonly besides?: readonly string[];
  /** Left to the node, a column of what was measured is better than one that says which row a row is. */
  readonly measured?: boolean;
}

/**
 * The column a node works on: the one its input names, or, when the input is
 * left to the node, the first that fits and that no other input took. A name
 * the table has not got is refused in words that say which it has, since a
 * column wired by hand is the likeliest thing to go wrong.
 */
export function pickColumn(table: Table, name: string | undefined, input: string, wanted: ColumnWanted = {}): Column {
  if (name !== undefined && name !== "") {
    const column = table.columns.find((each) => each.name === name);
    if (!column) throw new Error(`${input}: the table has no column ${name} — it has ${table.columns.map((each) => each.name).join(", ")}`);
    if (wanted.numeric && column.kind !== "number") throw new Error(`${input}: ${name} holds words, and this needs numbers`);
    return column;
  }
  const fitting = table.columns.filter((column) => (!wanted.numeric || column.kind === "number") && !wanted.besides?.includes(column.name));
  const column = (wanted.measured ? fitting.find((each) => !each.key) : undefined) ?? fitting[0];
  if (!column) throw new Error(`${input}: the table has no column ${wanted.numeric ? "of numbers" : "left"}`);
  return column;
}

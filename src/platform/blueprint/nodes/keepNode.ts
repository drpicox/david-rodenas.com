import type { NodeKind } from "../NodeKind";
import { pickColumn } from "../pickColumn";
import type { Cell, Table } from "../Table";

const TESTS: Readonly<Record<string, (cell: number | string, value: string) => boolean>> = {
  equals: (cell, value) => (typeof cell === "number" ? cell === Number(value) : cell === value),
  differs: (cell, value) => (typeof cell === "number" ? cell !== Number(value) : cell !== value),
  below: (cell, value) => compared(cell, value) < 0,
  "at-most": (cell, value) => compared(cell, value) <= 0,
  above: (cell, value) => compared(cell, value) > 0,
  "at-least": (cell, value) => compared(cell, value) >= 0,
  contains: (cell, value) => String(cell).toLowerCase().includes(value.toLowerCase()),
  "one-of": (cell, value) => value.split(/[\s,]+/).filter(Boolean).some((each) => (typeof cell === "number" ? cell === Number(each) : cell === each)),
};

/** A number against a number, words against words in the order a dictionary has them. */
function compared(cell: number | string, value: string): number {
  return typeof cell === "number" ? cell - Number(value) : cell.localeCompare(value);
}

/** Only the rows whose column is as asked: a month of summer, a year since 2000, a file in one box. A row with nothing in the column is never kept. */
export const keepNode: NodeKind = {
  name: "keep",
  title: "Keep rows",
  role: "step",
  shelf: "Tables",
  summary: "Only the rows whose column is as asked: equal to, above, below, one of some values, or containing some words.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "column", label: "column", type: "text", optional: true, editor: { kind: "column", of: "table" } },
    { name: "is", label: "is", type: "text", initial: "equals", editor: { kind: "choice", choices: Object.keys(TESTS).map((test) => ({ value: test, label: test.replace("-", " ") })) } },
    { name: "value", label: "value", type: "text", initial: "", hint: "a number, a word, or for one of, several of either" },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const column = pickColumn(table, inputs["column"] as string | undefined, "column");
    const test = TESTS[String(inputs["is"])];
    if (!test) throw new Error(`is: there is no test ${String(inputs["is"])}: there are ${Object.keys(TESTS).join(", ")}`);
    const value = String(inputs["value"] ?? "");
    const rows = table.rows.filter((row) => {
      const cell: Cell | undefined = row[column.name];
      return cell !== null && cell !== undefined && test(cell, value);
    });
    return { outputs: { table: { ...table, rows } }, said: `${rows.length} of ${table.rows.length} rows`, settled: { column: column.name } };
  },
};

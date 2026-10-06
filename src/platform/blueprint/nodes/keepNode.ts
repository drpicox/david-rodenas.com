import type { NodeKind } from "../NodeKind";
import { pickColumn } from "../pickColumn";
import { ROW_TESTS } from "../ROW_TESTS";
import type { Table } from "../Table";

/** Only the rows whose column is as asked: a month of summer, the years between two, a file in one box, the rows that have a value. */
export const keepNode: NodeKind = {
  name: "keep",
  title: "Keep rows",
  role: "step",
  shelf: "Tables",
  summary: "Only the rows whose column is as asked: equal to a value, above or below it, between two, one of several, containing some words, holding something or nothing.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "column", label: "column", type: "text", optional: true, editor: { kind: "column", of: "table" } },
    { name: "is", label: "is", type: "text", initial: "equals", editor: { kind: "choice", choices: Object.entries(ROW_TESTS).map(([value, test]) => ({ value, label: test.label })) } },
    { name: "value", label: "value", type: "text", initial: "", editor: { kind: "values", of: "table", column: "column", test: "is" }, hint: "a number or a word; two, for between, as 2000 2020; several, for one of, as 6 7 8" },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const column = pickColumn(table, inputs["column"] as string | undefined, "column");
    const test = ROW_TESTS[String(inputs["is"])];
    if (!test) throw new Error(`is: there is no test ${String(inputs["is"])}: there are ${Object.keys(ROW_TESTS).join(", ")}`);
    const value = String(inputs["value"] ?? "");
    const rows = table.rows.filter((row) => test.test(row[column.name], value));
    return { outputs: { table: { ...table, rows } }, said: `${rows.length} of ${table.rows.length} rows`, settled: { column: column.name } };
  },
};

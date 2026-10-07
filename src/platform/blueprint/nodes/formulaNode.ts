import { formulaOf } from "../formulaOf";
import type { NodeKind } from "../NodeKind";
import type { Table } from "../Table";

/** A new column worked out of the others, row by row: the range of a day, tx - tn; a ratio; a logarithm. */
export const formulaNode: NodeKind = {
  name: "formula",
  title: "Formula",
  role: "step",
  shelf: "Tables",
  summary: "A new column worked out of the others, row by row, with + − × ÷ ^, brackets and a few functions: tx - tn, log(lines).",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "name", label: "new column", type: "text", initial: "result", editor: { kind: "text" } },
    { name: "formula", label: "is", type: "text", initial: "", editor: { kind: "text" }, hint: "the names of columns, numbers, + - * / ^, brackets, and abs sqrt log log10 exp round min max" },
    { name: "unit", label: "unit", type: "text", optional: true, editor: { kind: "text" } },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const text = String(inputs["formula"] ?? "").trim();
    if (text === "") throw new Error("is: write a formula, as: tx - tn");
    const formula = formulaOf(text);
    const missing = formula.names.find((name) => !table.columns.some((column) => column.name === name));
    if (missing) throw new Error(`formula: the table has no column ${missing} — it has ${table.columns.map((column) => column.name).join(", ")}`);
    const name = String(inputs["name"] ?? "result").trim() || "result";
    const unit = inputs["unit"] ? String(inputs["unit"]) : undefined;
    const columns = [...table.columns.filter((column) => column.name !== name), { name, kind: "number" as const, ...(unit && { unit }), about: text }];
    return { outputs: { table: { ...table, columns, rows: table.rows.map((row) => ({ ...row, [name]: formula.at(row) })) } } };
  },
};

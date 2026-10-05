import type { NodeKind } from "../NodeKind";
import { pickColumn } from "../pickColumn";
import type { Table } from "../Table";

/** The rows with the most of a column, or the least: the files most needed, the hottest months. */
export const topNode: NodeKind = {
  name: "top",
  title: "Top rows",
  role: "step",
  shelf: "Tables",
  summary: "The rows with the most of a column, or the least, as many as asked.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "by", label: "by", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "count", label: "how many", type: "number", initial: 10, editor: { kind: "number", min: 1, max: 100, step: 1 } },
    { name: "end", label: "with the", type: "text", initial: "highest", editor: { kind: "choice", choices: [{ value: "highest", label: "most" }, { value: "lowest", label: "least" }] } },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const by = pickColumn(table, inputs["by"] as string | undefined, "by", { numeric: true, measured: true });
    const sign = inputs["end"] === "lowest" ? 1 : -1;
    const measured = table.rows.filter((row) => typeof row[by.name] === "number");
    const rows = [...measured].sort((a, b) => sign * (Number(a[by.name]) - Number(b[by.name]))).slice(0, Math.max(0, Math.round(Number(inputs["count"]))));
    return { outputs: { table: { ...table, rows } }, settled: { by: by.name } };
  },
};

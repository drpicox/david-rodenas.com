import { cellOrder } from "../cellOrder";
import type { NodeKind } from "../NodeKind";
import { pickColumn } from "../pickColumn";
import type { Cell, Row, Table } from "../Table";

/** The rows with the most of a column, or the least: the files most needed, the hottest months; or the hottest month of each year. */
export const topNode: NodeKind = {
  name: "top",
  title: "Top rows",
  role: "step",
  shelf: "Tables",
  summary: "The rows with the most of a column, or the least, as many as asked: of the whole table, or of each group of rows that share a column.",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "by", label: "by", type: "text", optional: true, editor: { kind: "column", of: "table", numeric: true } },
    { name: "count", label: "how many", type: "number", initial: 10, editor: { kind: "number", min: 1, max: 100, step: 1 } },
    { name: "end", label: "with the", type: "text", initial: "highest", editor: { kind: "choice", choices: [{ value: "highest", label: "most" }, { value: "lowest", label: "least" }] } },
    { name: "per", label: "in each", type: "text", optional: true, editor: { kind: "column", of: "table" }, hint: "as many from each group of rows that share this column, a group after another; from the whole table when left empty" },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const table = inputs["table"] as Table;
    const by = pickColumn(table, inputs["by"] as string | undefined, "by", { numeric: true, measured: true });
    const per = inputs["per"] ? pickColumn(table, inputs["per"] as string, "in each") : undefined;
    const sign = inputs["end"] === "lowest" ? 1 : -1;
    const count = Math.max(0, Math.round(Number(inputs["count"])));
    const groups = new Map<Cell | undefined, Row[]>();
    for (const row of table.rows.filter((each) => typeof each[by.name] === "number")) {
      const group = per && row[per.name];
      groups.set(group, [...(groups.get(group) ?? []), row]);
    }
    const rows = [...groups.entries()]
      .sort(([a], [b]) => cellOrder(a, b))
      .flatMap(([, members]) => [...members].sort((a, b) => sign * (Number(a[by.name]) - Number(b[by.name]))).slice(0, count));
    return { outputs: { table: { ...table, rows } }, settled: { by: by.name } };
  },
};

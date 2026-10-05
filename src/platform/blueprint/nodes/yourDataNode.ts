import type { NodeKind } from "../NodeKind";
import type { Cell, Column, Table } from "../Table";

/** The separator a pasted table uses: a tab, as a spreadsheet copies; a semicolon, as one set to a decimal comma saves; or a comma. */
const separatorOf = (line: string) => (line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",");

/**
 * A table pasted as text — its first line the names of its columns, then a
 * line a row — so a reader's own numbers can be set beside the site's. A
 * column is of numbers when every cell in it that holds anything is one.
 */
export const yourDataNode: NodeKind = {
  name: "your-data",
  title: "Your numbers",
  role: "source",
  shelf: "Tables",
  summary: "A table you paste as text, a first line of names, then a line a row: your own numbers, beside the site's.",
  inputs: [{ name: "text", label: "", type: "text", initial: "year, value\n2024, 1\n2025, 2", editor: { kind: "text", lines: 5 } }],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs) => {
    const lines = String(inputs["text"] ?? "").split(/\r?\n/).filter((line) => line.trim() !== "");
    const [head, ...body] = lines;
    if (!head) throw new Error("paste a table: a first line of names, then a line a row");
    const separator = separatorOf(head);
    const decimalComma = separator !== ",";
    const names = head.split(separator).map((name, at) => name.trim() || `column${at + 1}`);
    const cells = body.map((line) => line.split(separator).map((cell) => cell.trim()));
    const asNumber = (text: string) => Number(decimalComma ? text.replace(",", ".") : text);
    const numeric = names.map((_, at) => cells.every((row) => (row[at] ?? "") === "" || Number.isFinite(asNumber(row[at] ?? ""))));
    const columns: Column[] = names.map((name, at) => ({ name, kind: numeric[at] ? "number" : "text" }));
    const rows = cells.map((row) => Object.fromEntries(names.map((name, at): [string, Cell] => [name, (row[at] ?? "") === "" ? null : numeric[at] ? asNumber(row[at] ?? "") : (row[at] ?? "")])));
    return { outputs: { table: { columns, rows, credits: [{ said: "Your own numbers." }] } satisfies Table } };
  },
};

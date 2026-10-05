import { numberSaid } from "../numberSaid";
import type { Table } from "../Table";
import { type Markup, tag } from "../tag";

/**
 * A table as a table: its columns named, with their units, and its first
 * rows, numbers as a person would read them; how many more there are, when
 * there are more. What a reader with no script, and a search engine, read.
 */
export function tableMarkup(table: Table, most: number): Markup {
  const shown = table.rows.slice(0, Math.max(0, most));
  const head = tag("tr", {}, table.columns.map((column) => tag("th", { class: column.kind === "number" ? "number" : undefined }, column.name, column.unit ? tag("span", { class: "unit" }, ` ${column.unit}`) : null)));
  const body = shown.map((row) =>
    tag(
      "tr",
      {},
      table.columns.map((column) => {
        const cell = row[column.name];
        return tag("td", { class: column.kind === "number" ? "number" : undefined }, cell === null || cell === undefined ? "" : typeof cell === "number" ? numberSaid(cell) : cell);
      }),
    ),
  );
  const more = table.rows.length - shown.length;
  return tag("div", { class: "bp-table" }, tag("table", {}, tag("thead", {}, head), tag("tbody", {}, body)), more > 0 ? tag("p", { class: "more" }, `and ${more} ${more === 1 ? "row" : "rows"} more`) : null);
}

import type { Kit } from "./kitOf";
import { tableMarkup } from "./paint/tableMarkup";
import type { Table } from "./Table";
import { type Markup, tag } from "./tag";

/** As many rows as a look needs to see what a table holds. */
const ROWS = 8;

/** The columns that say what they are, each with its words. */
function columnsSaid(table: Table): Markup | null {
  const told = table.columns.filter((column) => column.about);
  return told.length > 0 ? tag("ul", { class: "bp-peek-columns" }, told.map((column) => tag("li", {}, tag("strong", {}, column.name), ` ${column.about}`))) : null;
}

/**
 * What flows out of an output, to look at: what it is, in words; a table's
 * first rows, and what its columns are where they say; and, of what becomes
 * a table wherever one is taken — a graph, the table of its files — that
 * table too, since that is what a wire from it carries into a table.
 */
export function peekOf(value: unknown, type: string, kit: Kit): Markup {
  const pinType = kit.types.get(type);
  const said = tag("p", { class: "bp-peek-said" }, `${pinType?.label ?? type}: ${pinType ? pinType.describe(value) : String(value)}`);
  const becomes = type === "table" ? undefined : pinType?.becomes?.["table"];
  const shown = type === "table" ? (value as Table) : becomes ? (becomes(value) as Table) : undefined;
  return tag("div", { class: "bp-peek" }, said, becomes ? tag("p", {}, `Wherever ${kit.types.get("table")?.label ?? "a table"} is taken, it is this one:`) : null, shown ? tableMarkup(shown, ROWS) : null, shown ? columnsSaid(shown) : null);
}

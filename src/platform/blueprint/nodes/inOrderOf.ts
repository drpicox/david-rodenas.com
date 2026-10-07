import type { Column } from "../Table";

/** The names a column's rows hold, in the order the column gives them, if it gives one — what it does not name after the rest — or else as the rows first hold them. */
export function inOrderOf(column: Column, names: Iterable<string>): string[] {
  const found = [...new Set(names)];
  const { order } = column;
  if (!order) return found;
  const at = (name: string) => (order.includes(name) ? order.indexOf(name) : order.length);
  return found.map((name, first) => ({ name, first })).sort((a, b) => at(a.name) - at(b.name) || a.first - b.first).map(({ name }) => name);
}

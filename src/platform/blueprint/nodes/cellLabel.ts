import type { Cell } from "../Table";

/** A cell as a category is named along an axis: a year as 2024, never 2,024 nor 2024.0; nothing as a dash. */
export function cellLabel(cell: Cell | undefined): string {
  if (cell === null || cell === undefined) return "—";
  return typeof cell === "number" ? String(Math.round(cell * 1000) / 1000) : cell;
}

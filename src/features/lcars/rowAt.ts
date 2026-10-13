import { SCHEMATIC } from "./SCHEMATIC";

/**
 * The row of a schematic a level is on, counted from the top: the one it is
 * in, or the nearer of two where it is in the gap between them. Over the
 * first it is the one before it, and under the last the one after: a row
 * that is not there yet, which a module let go there would open.
 */
export function rowAt(rows: readonly { readonly top: number; readonly height: number }[], y: number): number {
  const [first] = rows;
  if (!first) return 0;
  if (y < first.top - SCHEMATIC.between / 2) return -1;
  const found = rows.findIndex((row) => y < row.top + row.height + SCHEMATIC.between / 2);
  return found < 0 ? rows.length : found;
}

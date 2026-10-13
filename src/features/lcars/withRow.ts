/** Where a module stands on the grid of a schematic. */
export interface Stood {
  readonly id: string;
  readonly column: number;
  readonly row: number;
}

/**
 * The row every module of a schematic stands on once a hand has put one of
 * them on another row: each where it stood, so that nothing follows the one
 * moved, and whatever stood where it lands, in its column, changes places
 * with it. A row past the last, or before the first, is one of its own.
 */
export function withRow(modules: readonly Stood[], id: string, row: number): Map<string, number> {
  const rows = new Map(modules.map((module) => [module.id, module.row]));
  const moved = modules.find((module) => module.id === id);
  if (!moved) return rows;
  const there = modules.find((module) => module.id !== id && module.column === moved.column && module.row === row);
  if (there) rows.set(there.id, moved.row);
  rows.set(id, row);
  return rows;
}

import type { ItemKind } from "./World";

/** A room as the map draws it once it has been stood in: its ways out as they are now, and what it holds now. */
export interface Charted {
  /** `row,column`, row 0 the southmost. */
  readonly where: string;
  readonly name: string;
  /** North, south, east, west: -1 a wall, 0 open, otherwise the key that opens it. A door opened is open from then on, from that side. */
  readonly exits: readonly [number, number, number, number];
  readonly holds: { readonly kind: ItemKind | "monster"; readonly name: string } | null;
}

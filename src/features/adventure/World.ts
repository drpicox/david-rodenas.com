export type ItemKind = "weapon" | "shield" | "food" | "key";

export interface Item {
  readonly name: string;
  readonly kind: ItemKind;
  /** Damage, defence, life, or the number of the door it opens. */
  readonly value: number;
}

export interface Monster {
  readonly name: string;
  readonly attack: number;
  readonly defence: number;
  /** What it leaves behind when beaten. */
  readonly drops: string;
}

export interface Room {
  readonly name: string;
  /** North, south, east, west: -1 a wall, 0 open, otherwise the key that opens it. */
  readonly exits: readonly [number, number, number, number];
  /** The name of the item or monster in it at the start, or "nada". */
  readonly holds: string;
  readonly text: string;
}

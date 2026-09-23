import type { Lot } from "./Lot";

/** How a lot left the floor: who said "mine" and at what price, or nobody, and it was withdrawn. */
export interface Sale {
  readonly lot: Lot;
  readonly buyer: string | null;
  readonly price: number | null;
}

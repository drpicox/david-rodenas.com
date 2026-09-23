import type { Lot } from "./Lot";
import type { Sale } from "./Sale";

/**
 * What every buyer in the room is told, and all it is told: the lots still to
 * be sold, the credit each buyer has left, and every sale so far. The original
 * FishMarket announced the same, and it is the whole of what Vicente needed.
 */
export interface Market {
  readonly lots: readonly Lot[];
  readonly credits: Readonly<Record<string, number>>;
  readonly sales: readonly Sale[];
}

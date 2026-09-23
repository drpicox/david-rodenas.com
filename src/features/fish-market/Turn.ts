import type { Sale } from "./Sale";

/**
 * One lot's turn on the floor, as the board remembers it: how it went, and
 * the price each buyer was ready to shout at — the resale value over one
 * plus the margin it demanded, or nothing if it broke. Kept beside the sale
 * and not in it, because what the market announces to the buyers is the sale
 * alone; nobody is told the others' thresholds.
 */
export interface Turn {
  readonly sale: Sale;
  readonly bids: Readonly<Record<string, number | null>>;
  /** Who was ready to shout at a price it no longer had. */
  readonly short: readonly string[];
}

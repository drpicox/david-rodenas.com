import type { Lot } from "./Lot";
import type { Market } from "./Market";

/**
 * A buyer's whole mind, reduced to one number: the margin it demands.
 *
 * In a Dutch auction the price only falls, so there is nothing to decide but
 * *when* to shout — and that is a price, and a price on a lot of known resale
 * value is a margin, (value − price) / price. Every agent of December 2000
 * came down to how it chose that number; so does one written here.
 */
export interface Bidder {
  readonly name: string;
  /** The margin below which it will not say "mine" for this lot, right now. */
  demands(lot: Lot, market: Market, me: string): number;
}

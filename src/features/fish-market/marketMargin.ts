import type { Market } from "./Market";

/** What it comes to when the room has more money than fish: never a loss, but nearly anything. */
const LEAST = 0.001;

/**
 * The margin at which the market clears: what every unit spent would return
 * if the money in the room bought all the fish still on the floor. `greed` is
 * the share of their credit the others are believed able to spend — less
 * money chasing the fish, a higher margin. Every agent of December 2000 stood
 * on this number; Vicente stood on it alone.
 */
export function marketMargin(market: Market, greed: number): number {
  const fish = market.lots.reduce((sum, lot) => sum + lot.value, 0);
  const money = greed * Object.values(market.credits).reduce((sum, credit) => sum + credit, 0);
  if (money <= 0) return LEAST;
  return Math.max(LEAST, (fish - money) / money);
}

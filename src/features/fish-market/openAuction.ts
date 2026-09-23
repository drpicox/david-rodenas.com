import { randomOf } from "../../platform/random/randomOf";
import type { Bidder } from "./Bidder";
import { DutchAuction } from "./DutchAuction";
import { randomLots } from "./randomLots";

/** A morning's worth of lots. */
const LOTS = 60;

/**
 * A morning at the market: sixty lots grown from the seed, and every buyer
 * seated with the same credit — together, `money` of what all the fish
 * resells for. Under 1 there is less money than fish and the margin is
 * fought over; over 1 there is more money than fish and nobody need wait.
 */
export function openAuction(seed: number, bidders: readonly Bidder[], money: number): DutchAuction {
  const random = randomOf(seed);
  const lots = randomLots(LOTS, random);
  const fish = lots.reduce((sum, lot) => sum + lot.value, 0);
  return new DutchAuction(lots, bidders, (money * fish) / Math.max(1, bidders.length), random);
}

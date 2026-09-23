import type { Bidder } from "./Bidder";

/**
 * The buyer that has made up its mind before the auction starts. The two
 * naive agents on the page are this: one patient, demanding a margin the
 * others never let it see; one hasty, taking the first small profit.
 */
export function fixedMargin(name: string, margin: number): Bidder {
  return { name, demands: () => margin };
}

import type { Bidder } from "./Bidder";

/**
 * The visitor's agent: the body of a JavaScript function of `lot`, `market`
 * and `me`, compiled here in their own browser and seated at the same table
 * as the agents of 2000. A mistake in it throws, and the auction takes a
 * bidder that throws for one that says nothing. It runs with whatever the
 * page can do, which is what the visitor's own console can already do.
 */
export function ownBidder(source: string, name = "You"): Bidder {
  const demands = new Function("lot", "market", "me", source) as Bidder["demands"];
  return { name, demands };
}

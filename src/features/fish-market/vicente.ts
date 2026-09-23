import type { Bidder } from "./Bidder";
import { marketMargin } from "./marketMargin";

/**
 * The agent of 1–3 December 2000, rule for rule: it shouts at the margin at
 * which the market clears, and not before. The original kept two running
 * sums, taking each sold lot from one and each price paid from the other;
 * summing what is left comes to the same. Its one dial, `eficacia`, was 0.9.
 */
export function vicente(greed = 0.9, name = "Vicente"): Bidder {
  return { name, demands: (_lot, market) => marketMargin(market, greed) };
}

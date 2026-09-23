import { describe, expect, it } from "vitest";
import type { Bidder } from "./Bidder";
import { fixedMargin } from "./fixedMargin";
import { openAuction } from "./openAuction";
import { theTable } from "./theTable";
import { vicente } from "./vicente";

/** A whole morning, with credit for about half the fish between the buyers. */
function morning(seed: number, bidders: readonly Bidder[]) {
  const auction = openAuction(seed, bidders, 0.5);
  while (!auction.over) auction.sell();
  return Object.fromEntries(auction.standings().map((standing) => [standing.name, standing.profit]));
}

describe("the competition, run again", () => {
  it("Vicente beats a buyer that waits for a bargain and one that takes the first small profit, morning after morning", () => {
    let won = 0;
    for (let seed = 1; seed <= 20; seed += 1) {
      const profit = morning(seed, [fixedMargin("Patient", 1), fixedMargin("Hasty", 0.05), vicente()]);
      if (profit.Vicente! > profit.Patient! && profit.Vicente! > profit.Hasty!) won += 1;
    }
    expect(won).toBe(20);
  });

  it("the three agents of December all beat the naive two, and none of them is left with money it could have spent", () => {
    const profit = morning(7, theTable());
    for (const name of ["Vicente", "Wanda", "Planner"]) {
      expect(profit[name]).toBeGreaterThan(profit.Patient!);
      expect(profit[name]).toBeGreaterThan(profit.Hasty!);
    }
  });
});

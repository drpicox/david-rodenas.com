import { describe, expect, it } from "vitest";
import type { Bidder } from "./Bidder";
import { DutchAuction } from "./DutchAuction";
import { fixedMargin } from "./fixedMargin";

const lots = [
  { id: 1, kind: "hake", value: 100 },
  { id: 2, kind: "tuna", value: 400 },
];

describe("a Dutch auction", () => {
  it("lowers the price from above the resale value until the first buyer says mine, and sells at that price", () => {
    const auction = new DutchAuction(lots, [fixedMargin("patient", 1), fixedMargin("hasty", 0.1)], 1000, () => 0);
    const sale = auction.sell();
    // The hasty one accepts a 10% margin long before the patient one sees 100%.
    expect(sale.buyer).toBe("hasty");
    expect(sale.price).toBeLessThanOrEqual(100 / 1.1);
    expect(sale.price).toBeGreaterThan(100 / 1.1 - 5);
    expect(auction.market.credits.hasty).toBe(1000 - sale.price!);
  });

  it("withdraws a lot nobody wants, and tells everyone", () => {
    const auction = new DutchAuction(lots, [fixedMargin("never", Infinity)], 1000, () => 0);
    const sale = auction.sell();
    expect(sale).toEqual({ lot: lots[0], buyer: null, price: null });
    expect(auction.market.sales).toEqual([sale]);
    expect(auction.market.lots).toEqual([lots[1]]);
  });

  it("does not let a buyer shout for more than it has", () => {
    const auction = new DutchAuction(lots, [fixedMargin("broke", 0)], 50, () => 0);
    const sale = auction.sell();
    expect(sale.buyer).toBe("broke");
    expect(sale.price).toBeLessThanOrEqual(50);
  });

  it("breaks a tie by chance, where the real market restarted the round", () => {
    const twins = [fixedMargin("a", 0.5), fixedMargin("b", 0.5)];
    expect(new DutchAuction(lots, twins, 1000, () => 0).sell().buyer).toBe("a");
    expect(new DutchAuction(lots, twins, 1000, () => 0.99).sell().buyer).toBe("b");
  });

  it("keeps the standings: what each buyer spent, what it holds, and what it made", () => {
    const auction = new DutchAuction(lots, [fixedMargin("hasty", 0.1)], 1000, () => 0);
    auction.sell();
    auction.sell();
    expect(auction.over).toBe(true);
    const hasty = auction.standings()[0]!;
    expect(hasty.name).toBe("hasty");
    expect(hasty.lots).toBe(2);
    expect(hasty.value).toBe(500);
    expect(hasty.spent).toBeCloseTo(hasty.credit0 - auction.market.credits.hasty!);
    expect(hasty.profit).toBeCloseTo(500 - hasty.spent);
  });

  it("asks a bidder that throws nothing more, and treats it as one that never bids", () => {
    const broken: Bidder = {
      name: "broken",
      demands() {
        throw new Error("oops");
      },
    };
    const auction = new DutchAuction(lots, [broken, fixedMargin("hasty", 0.1)], 1000, () => 0);
    expect(auction.sell().buyer).toBe("hasty");
    expect(auction.standings()[0]!.error).toBe("oops");
  });
});

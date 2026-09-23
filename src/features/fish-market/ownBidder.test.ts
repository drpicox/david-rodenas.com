import { describe, expect, it } from "vitest";
import { ownBidder } from "./ownBidder";

const lot = { id: 1, kind: "hake", value: 100 };
const market = { lots: [lot], credits: { You: 50, other: 50 }, sales: [] };

describe("an agent written by a visitor", () => {
  it("is the body of a function of lot, market and me, and returns the margin it demands", () => {
    const bidder = ownBidder("return lot.value / market.credits[me];");
    expect(bidder.demands(lot, market, "You")).toBe(2);
  });

  it("is told, when it will not even compile, in the words of the engine", () => {
    expect(() => ownBidder("return (;")).toThrow(/Unexpected token/);
  });

  it("carries a mistake at run time to the auction, which knows what to do with one", () => {
    const bidder = ownBidder("return market.nothing.here;");
    expect(() => bidder.demands(lot, market, "You")).toThrow(/undefined/);
  });
});

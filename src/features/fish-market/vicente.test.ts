import { describe, expect, it } from "vitest";
import { vicente } from "./vicente";

const lots = [
  { id: 1, kind: "hake", value: 300 },
  { id: 2, kind: "tuna", value: 500 },
];
const credits = { Vicente: 200, other: 300 };

describe("Vicente, December 2000", () => {
  it("demands the margin at which the money in the room, less what the others will not spend, buys all the fish", () => {
    // 800 of fish, 500 of credit of which 90% will be spent: (800 − 450) / 450.
    const demanded = vicente(0.9).demands(lots[0]!, { lots, credits, sales: [] }, "Vicente");
    expect(demanded).toBeCloseTo((800 - 450) / 450);
  });

  it("moves the margin as lots sell and credit is spent, as the original did lot by lot", () => {
    const sold = { lot: lots[1]!, buyer: "other", price: 250 };
    const after = { lots: [lots[0]!], credits: { Vicente: 200, other: 50 }, sales: [sold] };
    // 300 of fish left, 250 of credit left: (300 − 225) / 225.
    expect(vicente(0.9).demands(lots[0]!, after, "Vicente")).toBeCloseTo((300 - 225) / 225);
  });

  it("never buys at a loss, even when the room has more money than fish", () => {
    const rich = { lots, credits: { Vicente: 2000, other: 2000 }, sales: [] };
    expect(vicente(0.9).demands(lots[0]!, rich, "Vicente")).toBeGreaterThan(0);
  });

  it("is more demanding the less it believes the others will spend: that is the one dial", () => {
    const market = { lots, credits, sales: [] };
    expect(vicente(0.7).demands(lots[0]!, market, "Vicente")).toBeGreaterThan(vicente(0.9).demands(lots[0]!, market, "Vicente"));
  });
});

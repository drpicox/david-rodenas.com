import { describe, expect, it } from "vitest";
import type { Lot } from "./Lot";
import { marketMargin } from "./marketMargin";
import { planner } from "./planner";

const lot = (id: number, value: number): Lot => ({ id, kind: "hake", value });
const ahead = Array.from({ length: 20 }, (_, i) => lot(100 + i, 100));

/** A history in which every lot went for the same margin. */
const soldAt = (margin: number, count: number) => Array.from({ length: count }, (_, i) => ({ lot: lot(i, 100), buyer: "rival", price: 100 / (1 + margin) }));

describe("the planner handed in on 15 December 2000", () => {
  it("stands on the market's margin while it has seen nothing sell", () => {
    const fresh = { lots: ahead, credits: { Planner: 400, rival: 400 }, sales: [] };
    expect(planner().demands(ahead[0]!, fresh, "Planner")).toBeCloseTo(marketMargin(fresh, 0.9));
  });

  it("asks for the margin the fish has been going at when its credit will be used up there anyway", () => {
    // 2000 of fish ahead, all of it expected to sell at twice the market's margin; the planner has money for a fifth of it.
    const credits = { Planner: 300, rival: 800 };
    const market = marketMargin({ lots: ahead, credits, sales: [] }, 0.9);
    const history = { lots: ahead, credits, sales: soldAt(market * 2, 10) };
    const demanded = planner().demands(ahead[0]!, history, "Planner");
    expect(demanded).toBeGreaterThan(market * 1.7);
    expect(demanded).toBeLessThanOrEqual(market * 2);
  });

  it("comes back down to the market's margin when it has more credit than the fish it could win above it", () => {
    const credits = { Planner: 1000, rival: 100 };
    const market = marketMargin({ lots: ahead, credits, sales: [] }, 0.9);
    const history = { lots: ahead, credits, sales: soldAt(market * 2, 10) };
    expect(planner().demands(ahead[0]!, history, "Planner")).toBeCloseTo(market);
  });
});

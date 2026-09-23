import { describe, expect, it } from "vitest";
import { marketMargin } from "./marketMargin";
import { wanda } from "./wanda";

const hake = { id: 1, kind: "hake", value: 300 };
const tuna = { id: 2, kind: "tuna", value: 500 };
const sardines = { id: 3, kind: "sardines", value: 100 };
const lots = [hake, tuna, sardines, { id: 4, kind: "hake", value: 300 }];
const credits = { Wanda: 300, rival: 300 };
const fresh = { lots, credits, sales: [] };

describe("Wanda, 10 December 2000", () => {
  it("starts where Vicente stood: the market's margin, believing the others will spend 98%", () => {
    expect(wanda().demands(hake, fresh, "Wanda")).toBeCloseTo(marketMargin(fresh, 0.98));
  });

  it("asks 5% more each time she wins a lot: she can afford to be choosier", () => {
    const won = { lots: lots.slice(1), credits: { Wanda: 200, rival: 300 }, sales: [{ lot: hake, buyer: "Wanda", price: 100 }] };
    expect(wanda().demands(tuna, won, "Wanda")).toBeCloseTo(marketMargin(won, 0.98) * 1.05);
  });

  it("asks 5% less when a rival doing at least as well takes a lot at a margin she would have accepted", () => {
    // The rival paid 100 for 300: a 200% margin, far above anything the market demands. Somebody is buying under her.
    const taken = { lots: lots.slice(1), credits: { Wanda: 300, rival: 200 }, sales: [{ lot: hake, buyer: "rival", price: 100 }] };
    expect(wanda().demands(tuna, taken, "Wanda")).toBeCloseTo(marketMargin(taken, 0.98) * 0.95);
  });

  it("lets a rival win cheaply without flinching when that rival is doing worse than her", () => {
    const sales = [
      { lot: hake, buyer: "Wanda", price: 100 },
      { lot: tuna, buyer: "rival", price: 480 },
    ];
    const later = { lots: lots.slice(2), credits: { Wanda: 200, rival: 20 }, sales };
    expect(wanda().demands(sardines, later, "Wanda")).toBeCloseTo(marketMargin(later, 0.98) * 1.05);
  });
});

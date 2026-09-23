import { describe, expect, it } from "vitest";
import { DutchAuction } from "./DutchAuction";
import { fixedMargin } from "./fixedMargin";
import { renderFishMarket } from "./renderFishMarket";
import { vicente } from "./vicente";

const lots = [
  { id: 1, kind: "hake", value: 100 },
  { id: 2, kind: "tuna", value: 400 },
];

describe("the board at the back of the room", () => {
  it("shows the next lot and what each buyer is asking for it, before the price starts to fall", () => {
    const auction = new DutchAuction(lots, [fixedMargin("Hasty", 0.05), vicente()], 200, () => 0);
    const html = renderFishMarket(auction);
    expect(html).toContain("hake");
    expect(html).toMatch(/Hasty.*5%/s);
    // 500 of fish, 400 of credit of which 90% will be spent: (500 − 360) / 360 = 39%.
    expect(html).toMatch(/Vicente.*39%/s);
  });

  it("ranks the buyers by what they made, and says what each holds and spent", () => {
    const auction = new DutchAuction(lots, [fixedMargin("Hasty", 0.05), fixedMargin("Never", Infinity)], 1000, () => 0);
    auction.sell();
    auction.sell();
    const html = renderFishMarket(auction);
    expect(html.indexOf("Hasty")).toBeLessThan(html.indexOf("Never"));
    expect(html).toMatch(/<tr[^>]*>.*Hasty.*2 lots.*<\/tr>/s);
    expect(html).toContain("The floor is empty");
  });

  it("lists the sales, the latest first, and a withdrawn lot as withdrawn", () => {
    const auction = new DutchAuction(lots, [fixedMargin("Never", Infinity)], 1000, () => 0);
    auction.sell();
    auction.sell();
    const html = renderFishMarket(auction);
    expect(html.indexOf("tuna")).toBeLessThan(html.indexOf("hake"));
    expect(html).toContain("withdrawn");
  });

  it("says when a buyer broke, in its own words", () => {
    const broken = { name: "Broken", demands: () => JSON.parse("{") as number };
    const auction = new DutchAuction(lots, [broken], 1000, () => 0);
    auction.sell();
    expect(renderFishMarket(auction)).toMatch(/Broken.*JSON/s);
  });
});

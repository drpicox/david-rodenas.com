import { describe, expect, it } from "vitest";
import { renderVoyages } from "./renderVoyages";

const tireless = { dryMass: 1, fuel: 1e30, exhaust: 1, acceleration: 1 };
const small = { dryMass: 25000, fuel: 5000, exhaust: 0.72, acceleration: 0.3 };

describe("every destination at once, for one ship", () => {
  it("is a table with both clocks side by side, because the difference between them is the point", () => {
    const html = renderVoyages(tireless, "Proxima Centauri");
    expect(html).toMatch(/Proxima Centauri.*4\.24 light-years.*3\.5 years.*5\.\d years/s);
    expect(html).toMatch(/Andromeda.*29 years.*2\.5 million years/s);
  });

  it("says how close to light it gets, in nines when a percentage would round to a hundred", () => {
    const html = renderVoyages(tireless, "Proxima Centauri");
    expect(html).toContain("95% of c");
    expect(html).toMatch(/the Moon.*km\/s/s);
    expect(html).toContain("99.99");
  });

  it("marks the trips this ship cannot burn all the way, and what that costs", () => {
    const html = renderVoyages(small, "Proxima Centauri");
    expect(html).toMatch(/<tr class="chosen coasts" data-destination="Proxima Centauri"/);
    expect(html).toContain("all 5,000 t");
    expect(html).toMatch(/the Moon.*<td>[\d.]+ t<\/td>/s);
  });

  it("draws the chosen trip as speed against the ship's clock: up, along, down", () => {
    const html = renderVoyages(small, "Proxima Centauri");
    expect(html).toContain('<svg class="trip"');
    expect(html).toContain("engine off");
    expect(renderVoyages(tireless, "Proxima Centauri")).not.toContain("engine off");
  });
});

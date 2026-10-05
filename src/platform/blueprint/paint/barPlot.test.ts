import { describe, expect, it } from "vitest";
import { barPlot } from "./barPlot";

const bars = barPlot({ categories: ["2023", "2024", "2025"], values: [10, null, 30], faded: [false, false, true], x: "year", y: "torrid nights", unit: "nights" }).html;
const rects = [...bars.matchAll(/<rect class="([^"]+)" data-key="([^"]+)" x="[^"]+" y="([^"]+)" width="[^"]+" height="([^"]+)"/g)];

describe("bars, one a category", () => {
  it("draws a bar for each value, and a gap, not a zero, where nothing was measured", () => {
    expect(rects.map((match) => match[2])).toEqual(["bar:2023", "bar:2025"]);
  });

  it("stands every bar on zero, as tall as its value", () => {
    const [low, high] = rects.map((match) => Number(match[4]));
    expect(high! / low!).toBeCloseTo(3, 1);
    const bottoms = rects.map((match) => Number(match[3]) + Number(match[4]));
    expect(bottoms[0]).toBeCloseTo(bottoms[1]!, 5);
  });

  it("draws faint what it was told to, and says each value when pointed at", () => {
    expect(rects.map((match) => match[1])).toEqual(["bar", "bar faded"]);
    expect(bars).toContain("<title>2025: 30 nights</title>");
  });

  it("is said in words, and its axes are named with the unit", () => {
    expect(bars).toContain('aria-label="torrid nights by year"');
    expect(bars).toMatch(/>torrid nights \(nights\)</);
  });
});

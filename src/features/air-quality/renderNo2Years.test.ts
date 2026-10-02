import { describe, expect, it } from "vitest";
import { renderNo2Years } from "./renderNo2Years";

const years = [
  { year: 2018, mean: 54.2, measured: 0.97 },
  { year: 2019, mean: 50, measured: 0.98 },
  { year: 2020, mean: 33.1, measured: 0.6 },
];

describe("the years, one bar each", () => {
  it("draws a bar a year that can be pointed at and picked", () => {
    const svg = renderNo2Years(years, { from: 2018, to: 2020 });
    expect(svg.match(/class="hit"/g)).toHaveLength(3);
    expect(svg).toContain('data-year="2019"');
    expect(svg).toContain("<title>2018: 54.2 µg/m³</title>");
  });

  it("lights the years the table above is the mean of", () => {
    const svg = renderNo2Years(years, { from: 2019, to: 2019 });
    expect(svg.match(/class="bar chosen/g)).toHaveLength(1);
    expect(svg).toMatch(/class="bar chosen[^"]*" data-year="2019"/);
  });

  it("draws a year that was mostly not measured as an outline, and says why", () => {
    const svg = renderNo2Years(years, { from: 2018, to: 2020 });
    expect(svg).toMatch(/class="bar chosen partial" data-year="2020"/);
    expect(svg).toContain("<title>2020: 33.1 µg/m³, from only 60% of the year's hours</title>");
  });

  it("draws the year still running in grey, however much of it was measured, and says the day it reaches", () => {
    const svg = renderNo2Years([...years, { year: 2026, mean: 30.1, measured: 0.8 }], { from: 2018, to: 2026 }, { year: 2026, through: "2026-09-28" });
    expect(svg).toMatch(/class="bar chosen running" data-year="2026"/);
    expect(svg).toContain("<title>2026 so far, to 28 September: 30.1 µg/m³</title>");
  });

  it("rules the two lines an annual mean is held against", () => {
    const svg = renderNo2Years(years, { from: 2018, to: 2020 });
    expect(svg).toContain("EU limit, 40");
    expect(svg).toContain("WHO guideline, 10");
  });

  it("is twice as high on the same scale when the mean is twice as much", () => {
    const heights = [...renderNo2Years([{ year: 2000, mean: 20, measured: 1 }, { year: 2001, mean: 40, measured: 1 }], { from: 2000, to: 2001 }).matchAll(/class="bar[^"]*"[^>]* height="([\d.]+)"/g)].map((match) => Number(match[1]));
    expect(heights[1]).toBeCloseTo((heights[0] ?? 0) * 2);
  });
});

import { describe, expect, it } from "vitest";
import { yearBars } from "./yearBars";

const bars = [
  { year: 2018, value: 54.2, title: "2018: 54.2" },
  { year: 2019, value: 50, title: "2019: 50", chosen: true },
  { year: 2021, value: 33.1, title: "2021: 33.1, partly", partial: true },
];

describe("a bar for each year", () => {
  it("gives every year a bar that can be pointed at and picked, and says what it is", () => {
    const svg = yearBars(bars, { label: "Something a year" });
    expect(svg.match(/class="hit"/g)).toHaveLength(3);
    expect(svg).toContain('data-year="2019"');
    expect(svg).toContain("<title>2018: 54.2</title>");
    expect(svg).toContain('aria-label="Something a year"');
  });

  it("keeps a year's place on the axis when the year is missing", () => {
    const x = (year: number) => Number(new RegExp(`class="hit" data-year="${year}" x="([\\d.]+)"`).exec(yearBars(bars, { label: "" }))?.[1]);
    expect(x(2021) - x(2019)).toBeCloseTo(2 * (x(2019) - x(2018)));
  });

  it("marks the chosen years, and draws a partial one as an outline", () => {
    const svg = yearBars(bars, { label: "" });
    expect(svg).toMatch(/class="bar chosen" data-year="2019"/);
    expect(svg).toMatch(/class="bar partial" data-year="2021"/);
  });

  it("is twice as high when the value is twice as much, because it starts at zero", () => {
    const svg = yearBars([{ year: 2000, value: 20, title: "" }, { year: 2001, value: 40, title: "" }], { label: "" });
    const heights = [...svg.matchAll(/class="bar[^"]*"[^>]* height="([\d.]+)"/g)].map((match) => Number(match[1]));
    expect(heights[1]).toBeCloseTo((heights[0] ?? 0) * 2);
  });

  it("holds the scale where it is told to, so two charts can be compared by eye", () => {
    const height = (top?: number) => Number(/class="bar[^"]*"[^>]* height="([\d.]+)"/.exec(yearBars([{ year: 2000, value: 20, title: "" }], { label: "", top }))?.[1]);
    expect(height(80)).toBeLessThan(height());
  });

  it("rules a line it is given to be held against, and a level across a run of years", () => {
    const svg = yearBars(bars, { label: "", references: [{ value: 40, label: "limit, 40" }], spans: [{ from: 2018, to: 2019, value: 52, label: "52 a year" }] });
    expect(svg).toContain("limit, 40");
    expect(svg).toContain("52 a year");
    expect(svg.match(/<line class="span"/g)).toHaveLength(1);
  });
});

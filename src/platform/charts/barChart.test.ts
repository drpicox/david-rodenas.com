import { describe, expect, it } from "vitest";
import { barChart } from "./barChart";
import { CHART } from "./CHART";

const baseline = CHART.height - CHART.pad.bottom;
const chart = barChart(
  [
    { name: "Clean", className: "clean", values: [2, 4, 6] },
    { name: "Debt", className: "debt", values: [3, 3, 3] },
  ],
  { x: "month", y: "features" },
  ["Jan", "Feb", "Mar"],
);
const bars = [...chart.matchAll(/<rect class="(clean|debt)" x="[\d.]+" y="([\d.]+)" width="[\d.]+" height="([\d.]+)"><title>([^<]*)<\/title>/g)];

describe("a bar chart", () => {
  it("draws a bar for every value of every series, each standing on the axis, and the tallest the highest value", () => {
    expect(bars).toHaveLength(6);
    for (const [, , y, height] of bars) expect(Number(y) + Number(height)).toBeCloseTo(baseline, 0);
    const tallest = Math.max(...bars.map(([, , , height]) => Number(height)));
    expect(bars.find(([, , , height]) => Number(height) === tallest)?.[4]).toBe("Clean: 6");
  });

  it("makes a bar as long as its value: twice the value, twice the bar", () => {
    const [two, four] = [bars[0]?.[3], bars[1]?.[3]].map(Number);
    expect(four).toBeCloseTo(2 * (two ?? 0), 0);
  });

  it("names each group under it, and every series in the legend, and says what it measures", () => {
    for (const name of ["Jan", "Feb", "Mar", "Clean", "Debt"]) expect(chart).toContain(`>${name}</text>`);
    expect(chart).toContain('aria-label="features by month"');
  });
});

import { describe, expect, it } from "vitest";
import { CHART } from "./CHART";
import { lineChart } from "./lineChart";

const chart = lineChart(
  [
    { name: "Clean", className: "clean", values: [0, 5, 10] },
    { name: "Debt", className: "debt", values: [0, 2, 4] },
  ],
  { x: "month", y: "delivered" },
);
const lines = [...chart.matchAll(/<polyline class="line (\w+)" points="([^"]+)"><title>(\w+)<\/title>/g)];
const points = (index: number) => (lines[index]?.[2] ?? "").split(" ").map((point) => point.split(",").map(Number));

describe("a line chart", () => {
  it("draws a line for every series, through every one of its values, across the whole width", () => {
    expect(lines.map(([, className]) => className)).toEqual(["clean", "debt"]);
    expect(points(0)).toHaveLength(3);
    expect(points(0)[0]?.[0]).toBeCloseTo(CHART.pad.left, 0);
    expect(points(0)[2]?.[0]).toBeCloseTo(CHART.width - CHART.pad.right, 0);
  });

  it("puts the highest value at the top, and nought on the axis", () => {
    expect(points(0)[2]?.[1]).toBeCloseTo(CHART.pad.top, 0);
    expect(points(0)[0]?.[1]).toBeCloseTo(CHART.height - CHART.pad.bottom, 0);
  });

  it("names every series in the legend, and says what it measures", () => {
    expect(chart).toContain(">Clean</text>");
    expect(chart).toContain(">Debt</text>");
    expect(chart).toContain('aria-label="delivered by month"');
  });
});

import { describe, expect, it } from "vitest";
import { scatterPlot } from "./scatterPlot";

describe("two columns against each other, a dot a row", () => {
  const html = scatterPlot({
    points: [
      { x: 10, y: 40, key: "2024-01", label: "January 2024", group: 0 },
      { x: 30, y: 20, key: "2024-07", label: "July 2024", group: 1 },
    ],
    groups: ["winter", "summer"],
    x: "tx",
    y: "no2",
    fit: { slope: -1, intercept: 50 },
  }).html;

  it("draws a dot a row, keyed by it and coloured by its group", () => {
    expect(html.match(/<circle class="dot bp-s\d" data-key="[^"]+"/g)).toEqual(['<circle class="dot bp-s0" data-key="dot:2024-01"', '<circle class="dot bp-s1" data-key="dot:2024-07"']);
  });

  it("says which row a dot is, and its two values, when pointed at", () => {
    expect(html).toContain("<title>July 2024: 30, 20</title>");
  });

  it("draws the fitted line across the dots, falling where it falls", () => {
    const [, y1, y2] = /class="fit" data-key="fit" x1="[^"]+" y1="([^"]+)" x2="[^"]+" y2="([^"]+)"/.exec(html) ?? [];
    expect(Number(y2)).toBeGreaterThan(Number(y1));
  });

  it("names its groups", () => {
    expect(html).toMatch(/>summer</);
  });
});

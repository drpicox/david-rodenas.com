import { describe, expect, it } from "vitest";
import { yearLine } from "./yearLine";

const points = [
  { year: 2018, value: 19.2, title: "2018: 19.2" },
  { year: 2019, value: 19.8, title: "2019: 19.8" },
  { year: 2021, value: 20.4, title: "2021: 20.4", partial: true },
];

describe("a figure that does not start at zero, year by year", () => {
  it("is a dot a year, each one saying what it is", () => {
    const svg = yearLine(points, { label: "Mean minimum" });
    expect(svg.match(/<circle/g)).toHaveLength(3);
    expect(svg).toContain("<title>2019: 19.8</title>");
  });

  it("joins neighbouring years and leaves a gap where a year is missing, rather than invent it", () => {
    const svg = yearLine(points, { label: "" });
    expect(svg.match(/<polyline/g)).toHaveLength(2);
  });

  it("draws a partial year hollow", () => {
    expect(yearLine(points, { label: "" })).toMatch(/<circle class="dot partial"/);
  });

  it("fits the scale to the figures instead of to zero, where a degree would not show", () => {
    const svg = yearLine(points, { label: "" });
    expect(svg).toContain(">19<");
    expect(svg).not.toContain(">0<");
  });
});

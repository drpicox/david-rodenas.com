import { describe, expect, it } from "vitest";
import { PLOT } from "./PLOT";
import { plotFrame } from "./plotFrame";
import { scaleOf } from "./scaleOf";

describe("the frame a picture stands in", () => {
  const frame = plotFrame({ label: "year", scale: scaleOf([2000, 2020]) }, { label: "days", scale: scaleOf([0, 40], { zero: true }) });

  it("puts the low end of x at the left of the inside and the high end at the right", () => {
    expect(frame.x(2000)).toBe(PLOT.pad.left);
    expect(frame.x(2020)).toBe(PLOT.width - PLOT.pad.right);
  });

  it("puts the low end of y at the bottom of the inside and the high end at the top", () => {
    expect(frame.y(0)).toBe(PLOT.height - PLOT.pad.bottom);
    expect(frame.y(40)).toBe(PLOT.pad.top);
  });

  it("draws a grid line and a number for each tick, and names both axes", () => {
    expect(frame.grid.html.match(/class="grid"/g)?.length).toBe(5 + 5);
    expect(frame.grid.html).toContain(">2010<");
    expect(frame.grid.html).toMatch(/class="axis-name x"[^>]*>year</);
    expect(frame.grid.html).toMatch(/class="axis-name y"[^>]*>days</);
  });

  it("stands categories in bands, and names only as many as fit", () => {
    const years = Array.from({ length: 36 }, (_, at) => String(1990 + at));
    const banded = plotFrame({ label: "year", bands: years }, { label: "days", scale: scaleOf([0, 1]) });
    expect(banded.band?.width).toBeCloseTo((PLOT.width - PLOT.pad.left - PLOT.pad.right) / 36);
    expect(banded.grid.html.match(/class="tick x"/g)?.length).toBeLessThanOrEqual(12);
    expect(banded.grid.html).toContain(">1990<");
  });
});

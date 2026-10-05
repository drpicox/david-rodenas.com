import { describe, expect, it } from "vitest";
import { linePlot } from "./linePlot";

describe("lines over a common x", () => {
  const html = linePlot({
    series: [
      { name: "Eixample", points: [[2000, 60], [2001, 58], [2002, 55], [2005, 50], [2006, 49]] },
      { name: "Montseny", points: [[2000, 6], [2001, 5]] },
    ],
    x: "year",
    y: "NO2",
    unit: "µg/m³",
  }).html;

  it("draws a line a series, each in a colour of its own, keyed by its name", () => {
    expect(html.match(/<g class="series bp-s\d" data-key="line:[^"]+">/g)).toEqual(['<g class="series bp-s0" data-key="line:Eixample">', '<g class="series bp-s1" data-key="line:Montseny">']);
  });

  it("breaks a line where years are missing, instead of drawing across them", () => {
    const d = /data-key="line:Eixample"><path class="line" d="([^"]+)"/.exec(html)?.[1] ?? "";
    expect(d.match(/M/g)?.length).toBe(2);
  });

  it("names the lines along the top, and says each point when pointed at", () => {
    expect(html).toMatch(/class="entry bp-s1".*>Montseny</);
    expect(html).toContain("<title>Eixample, 2005: 50 µg/m³</title>");
  });
});

import { describe, expect, it } from "vitest";
import { heatPlot } from "./heatPlot";

describe("a grid of cells, each as deep as its value", () => {
  const months = ["1", "2"];
  const hours = ["1", "2", "3"];
  const values = new Map([
    ["0:0", 10],
    ["1:0", 40],
    ["1:2", 25],
  ]);
  const html = heatPlot({ xs: months, ys: hours, values, x: "month", y: "hour", unit: "µg/m³" }).html;

  it("draws a cell for each value, and none where there is none", () => {
    expect(html.match(/class="cell"/g)?.length).toBe(3);
    expect(html).toContain('data-key="cell:2:3"');
  });

  it("colours the largest deepest, mixed into the paper in the theme's own colour", () => {
    const share = (key: string) => Number(new RegExp(`data-key="cell:${key}"[^>]*color-mix\\(in srgb, var\\(--bp-heat\\) (\\d+)%`).exec(html)?.[1]);
    expect(share("2:1")).toBeGreaterThan(share("2:3"));
    expect(share("2:3")).toBeGreaterThan(share("1:1"));
  });

  it("colours above zero warm and below cold, when the values run both sides of it", () => {
    const both = heatPlot({ xs: ["a", "b"], ys: ["c"], values: new Map([["0:0", -2], ["1:0", 3]]), x: "x", y: "y" }).html;
    expect(both).toContain("var(--bp-cold)");
    expect(both).toContain("var(--bp-warm)");
  });

  it("says what each cell holds, and what the palest and the deepest are", () => {
    expect(html).toContain("<title>month 2, hour 3: 25 µg/m³</title>");
    expect(html).toContain(">40 µg/m³<");
  });
});

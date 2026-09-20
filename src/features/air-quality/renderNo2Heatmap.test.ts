import { describe, expect, it } from "vitest";
import { aStation, flatSums } from "./aStation";
import { no2Grid } from "./no2Grid";
import { renderNo2Heatmap } from "./renderNo2Heatmap";

const gridOf = (value: number) => no2Grid(aStation({ "2019": { workdays: flatSums(value, 20), weekends: flatSums(value, 8) } }), { from: 2019, to: 2019, days: "all" });

describe("the picture, as a table anyone can read", () => {
  it("is a real table: twelve months across, twenty-four hours down, the numbers in it", () => {
    const html = renderNo2Heatmap(gridOf(47.4));
    expect(html.match(/<tr>/g)).toHaveLength(25);
    expect(html).toContain("<th scope=\"col\">Jan</th>");
    expect(html).toContain("<th scope=\"row\">09</th>");
    expect(html.match(/>47<\/td>/g)).toHaveLength(24 * 12);
  });

  it("colours on one fixed scale, so the same colour is the same air at any station in any year", () => {
    expect(renderNo2Heatmap(gridOf(40))).toContain("--v:0.5");
    expect(renderNo2Heatmap(gridOf(20))).toContain("--v:0.25");
    expect(renderNo2Heatmap(gridOf(200))).toContain("--v:1");
  });

  it("turns the number light where the cell has gone dark", () => {
    expect(renderNo2Heatmap(gridOf(70))).toContain('class="deep"');
    expect(renderNo2Heatmap(gridOf(10))).not.toContain('class="deep"');
  });

  it("says what a cell is when pointed at: the month, the hour, the mean and what it is a mean of", () => {
    expect(renderNo2Heatmap(gridOf(47.4))).toContain('title="March, hour 09: 47.4 µg/m³, the mean of 28 measurements"');
  });

  it("leaves a cell empty where nothing was measured", () => {
    const nothing = no2Grid(aStation({}), { from: 2019, to: 2019, days: "all" });
    expect(renderNo2Heatmap(nothing)).toContain('<td class="none"></td>');
  });
});

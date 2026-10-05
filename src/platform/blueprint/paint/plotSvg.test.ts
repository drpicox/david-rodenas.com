import { describe, expect, it } from "vitest";
import { tag } from "../tag";
import { PLOT } from "./PLOT";
import { plotSvg } from "./plotSvg";

describe("a picture's outer element", () => {
  it("is drawn in the picture's own units, made taller for what goes under it, and said in words", () => {
    expect(plotSvg("days by year", 0, tag("g", {})).html).toBe(`<svg class="bp-plot" viewBox="0 0 ${PLOT.width} ${PLOT.height}" role="img" aria-label="days by year"><g></g></svg>`);
    expect(plotSvg("days by year", 22).html).toContain(`viewBox="0 0 ${PLOT.width} ${PLOT.height + 22}"`);
  });
});

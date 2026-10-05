import { describe, expect, it } from "vitest";
import { tag } from "../tag";
import { PLOT } from "./PLOT";
import { plotSvg } from "./plotSvg";

describe("a picture's outer element", () => {
  it("is drawn in the picture's own units, and said in words", () => {
    expect(plotSvg("days by year", tag("g", {})).html).toBe(`<svg class="bp-plot" viewBox="0 0 ${PLOT.width} ${PLOT.height}" role="img" aria-label="days by year"><g></g></svg>`);
  });
});

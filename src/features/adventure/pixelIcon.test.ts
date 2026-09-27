import { describe, expect, it } from "vitest";
import { pixelIcon } from "./pixelIcon";

describe("a picture drawn in pixels, a row of letters at a time", () => {
  const icon = pixelIcon(["ab.", "..b"], { a: "red", b: "var(--ink)" });

  it("is an SVG as many pixels wide and high as the rows say, kept sharp", () => {
    expect(icon).toMatch(/^<svg class="pixel" viewBox="0 0 3 2" shape-rendering="crispEdges" aria-hidden="true">/);
  });

  it("paints each letter its colour, a run of one colour in one piece, and leaves a dot empty", () => {
    expect(icon).toContain('<rect x="0" y="0" width="1" height="1" fill="red"/>');
    expect(icon).toContain('<rect x="1" y="0" width="1" height="1" fill="var(--ink)"/>');
    expect(icon).toContain('<rect x="2" y="1" width="1" height="1" fill="var(--ink)"/>');
    expect(icon.match(/<rect/g)).toHaveLength(3);
    expect(pixelIcon(["aaa"], { a: "red" })).toContain('<rect x="0" y="0" width="3" height="1" fill="red"/>');
  });
});

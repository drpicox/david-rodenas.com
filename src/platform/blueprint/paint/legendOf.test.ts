import { describe, expect, it } from "vitest";
import { legendOf } from "./legendOf";
import { PLOT } from "./PLOT";

describe("the names of a picture's series", () => {
  it("are left out for a single series, which needs no name", () => {
    expect(legendOf(["only"])).toEqual({ markup: { html: '<g class="legend"></g>' }, height: 0 });
  });

  it("stand each beside a swatch of its series' colour, under the picture", () => {
    const { markup, height } = legendOf(["Eixample", "Poblenou"]);
    expect(markup.html.match(/class="entry bp-s\d"/g)).toEqual(['class="entry bp-s0"', 'class="entry bp-s1"']);
    expect(markup.html).toContain(">Poblenou<");
    expect(Number(/<rect x="[^"]+" y="([^"]+)"/.exec(markup.html)?.[1])).toBeGreaterThan(PLOT.height);
    expect(height).toBe(22);
  });

  it("take as many rows as they need inside the picture's width, cut long names short, and stop at eight, saying how many more", () => {
    const { markup, height } = legendOf(Array.from({ length: 11 }, (_, at) => `Barcelona measuring point ${at}`));
    expect(markup.html.match(/class="entry/g)?.length).toBe(8);
    expect(markup.html).toContain(">Barcelona measuring poi…<");
    expect(markup.html).toContain(">+3 more<");
    const xs = [...markup.html.matchAll(/<rect x="([^"]+)"/g)].map((match) => Number(match[1]));
    expect(Math.max(...xs)).toBeLessThan(PLOT.width - PLOT.pad.right);
    expect(height).toBeGreaterThan(3 * 16);
  });
});

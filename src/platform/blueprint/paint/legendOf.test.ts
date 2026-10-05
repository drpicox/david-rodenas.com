import { describe, expect, it } from "vitest";
import { legendOf } from "./legendOf";

describe("the names of a picture's series", () => {
  it("are left out for a single series, which needs no name", () => {
    expect(legendOf(["only"]).html).toBe('<g class="legend"></g>');
  });

  it("stand each beside a swatch of its series' colour", () => {
    const html = legendOf(["Eixample", "Poblenou"]).html;
    expect(html.match(/class="entry bp-s\d"/g)).toEqual(['class="entry bp-s0"', 'class="entry bp-s1"']);
    expect(html).toContain(">Poblenou<");
  });

  it("are cut short when long, and stop at eight, saying how many more there are", () => {
    const html = legendOf(Array.from({ length: 11 }, (_, at) => `Barcelona station number ${at}`)).html;
    expect(html.match(/class="entry/g)?.length).toBe(8);
    expect(html).toContain(">Barcelona station…<");
    expect(html).toContain(">+3<");
  });
});

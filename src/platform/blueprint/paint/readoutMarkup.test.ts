import { describe, expect, it } from "vitest";
import { readoutMarkup } from "./readoutMarkup";

describe("one number, large", () => {
  it("is said as it would be read, with its unit and a line on what it is", () => {
    expect(readoutMarkup(-0.4213, "r", "monthly heat against NO2").html).toBe('<div class="bp-readout"><span class="value">−0.421</span><span class="unit"> r</span><p class="about">monthly heat against NO2</p></div>');
  });

  it("needs neither", () => {
    expect(readoutMarkup(12, undefined, undefined).html).toBe('<div class="bp-readout"><span class="value">12</span></div>');
  });
});

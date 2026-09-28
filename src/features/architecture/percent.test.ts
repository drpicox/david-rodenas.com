import { describe, expect, it } from "vitest";
import { percent } from "./percent";

describe("a share, as a reader reads it", () => {
  it("is whole from ten per cent up, and to a tenth below, where a tenth is most of what there is", () => {
    expect([percent(1, 4), percent(106, 467), percent(1, 31), percent(176, 23015), percent(1, 25)]).toEqual(["25%", "23%", "3.2%", "0.8%", "4%"]);
  });

  it("is a dash when there was nothing to count", () => {
    expect(percent(0, 0)).toBe("–");
  });
});

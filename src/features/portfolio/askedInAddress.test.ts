import { describe, expect, it } from "vitest";
import { askedInAddress } from "./askedInAddress";

describe("the layout an address asks for", () => {
  it("is on or off, from ?portfolio=", () => {
    expect(askedInAddress("?portfolio=on")).toBe("on");
    expect(askedInAddress("?a=1&portfolio=off")).toBe("off");
  });

  it("is nothing when the address does not say, or says something else", () => {
    expect(askedInAddress("")).toBeUndefined();
    expect(askedInAddress("?portfolio=yes")).toBeUndefined();
  });
});

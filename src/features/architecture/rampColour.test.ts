import { describe, expect, it } from "vitest";
import { rampColour } from "./rampColour";

describe("a colour along a ramp", () => {
  it("runs from stop to stop, evenly spaced, in a straight line between each two", () => {
    expect(rampColour(["#000000", "#ffffff"], 0.5)).toBe("#808080");
    expect(rampColour(["#000000", "#ff0000", "#ffffff"], 0.25)).toBe("#800000");
    expect(rampColour(["#000000", "#ff0000", "#ffffff"], 1)).toBe("#ffffff");
  });

  it("reads the short way of writing a colour too, and keeps within the ends", () => {
    expect(rampColour(["#000", "#fff"], 2)).toBe("#ffffff");
    expect(rampColour(["#000", "#fff"], -1)).toBe("#000000");
  });

  it("gives the nearer stop when a colour cannot be read", () => {
    expect(rampColour(["rgb(0 0 0)", "#ffffff"], 0.8)).toBe("#ffffff");
  });
});

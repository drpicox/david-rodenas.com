import { describe, expect, it } from "vitest";
import { featureSizeScale } from "./featureSizeScale";

describe("the dial a feature's size is slid along", () => {
  it("is straight up to 500 hours, so a task is set to the hour", () => {
    expect(featureSizeScale.sizeAt(300)).toBe(300);
    expect(featureSizeScale.positionOf(300)).toBe(300);
  });

  it("is coarser beyond, so an epic of ten thousand hours still fits on it", () => {
    expect(featureSizeScale.sizeAt(750)).toBe(1000);
    expect(featureSizeScale.sizeAt(1000)).toBe(10000);
  });

  it("puts a size back where it was slid from", () => {
    for (const position of [0, 250, 500, 600, 750, 900, 1000]) expect(featureSizeScale.positionOf(featureSizeScale.sizeAt(position))).toBeCloseTo(position);
  });
});

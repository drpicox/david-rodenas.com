import { describe, expect, it } from "vitest";
import { scaleOf } from "./scaleOf";

describe("an axis for some values", () => {
  it("runs between round numbers that hold every value, with round ticks", () => {
    const scale = scaleOf([3.2, 17.9]);
    expect([scale.low, scale.high]).toEqual([0, 20]);
    expect(scale.ticks).toEqual([0, 5, 10, 15, 20]);
  });

  it("need not start at zero, when the values are far from it", () => {
    const scale = scaleOf([1991, 2025]);
    expect([scale.low, scale.high]).toEqual([1990, 2030]);
    expect(scale.ticks).toEqual([1990, 2000, 2010, 2020, 2030]);
  });

  it("starts at zero when asked, as bars must, and spans values below zero too", () => {
    expect(scaleOf([40, 45], { zero: true }).low).toBe(0);
    const both = scaleOf([-0.62, 0.41]);
    expect([both.low, both.high]).toEqual([-0.75, 0.5]);
    expect(both.ticks).toContain(0);
  });

  it("says where a value falls along it, from 0 at the low end to 1 at the high", () => {
    const scale = scaleOf([0, 10]);
    expect(scale.at(5)).toBe(0.5);
  });

  it("gives one value, or none, a span to stand in", () => {
    expect(scaleOf([7]).ticks.length).toBeGreaterThan(1);
    expect([scaleOf([]).low, scaleOf([]).high]).toEqual([0, 1]);
  });
});

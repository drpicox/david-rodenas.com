import { describe, expect, it } from "vitest";
import { fitOf } from "./fitOf";
import { ranked } from "./ranked";
import { summaryOf } from "./summaryOf";

describe("a straight line fitted through points, and how well it fits", () => {
  it("finds the line points on a line lie on, and a correlation of one", () => {
    expect(fitOf([1, 2, 3, 4], [3, 5, 7, 9])).toEqual({ n: 4, r: 1, slope: 2, intercept: 1 });
  });

  it("finds a falling line falling, and its correlation below zero", () => {
    const fit = fitOf([1, 2, 3, 4, 5], [5, 4, 4, 2, 1]);
    expect(fit.slope).toBeCloseTo(-1);
    expect(fit.r).toBeCloseTo(-0.9623, 3);
  });

  it("has no line through fewer than two points, nor through points that do not move", () => {
    expect(Number.isNaN(fitOf([1], [1]).slope)).toBe(true);
    expect(Number.isNaN(fitOf([1, 2, 3], [4, 4, 4]).r)).toBe(true);
  });
});

describe("ranks, for a correlation that only asks whether more goes with more", () => {
  it("numbers the values from the smallest, and shares a rank among equal values", () => {
    expect(ranked([30, 10, 20, 20])).toEqual([4, 1, 2.5, 2.5]);
  });
});

describe("a column of numbers in a few figures", () => {
  it("counts, averages, finds the middle, the spread and both ends", () => {
    const summary = summaryOf([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(summary).toMatchObject({ count: 8, mean: 5, median: 4.5, lowest: 2, highest: 9 });
    expect(summary.deviation).toBeCloseTo(2.138, 3);
  });

  it("finds the middle of an odd count, and says nothing of nothing", () => {
    expect(summaryOf([3, 1, 2]).median).toBe(2);
    expect(summaryOf([]).count).toBe(0);
    expect(Number.isNaN(summaryOf([]).mean)).toBe(true);
  });
});

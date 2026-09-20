import { describe, expect, it } from "vitest";
import { histogramOf } from "./histogramOf";

describe("a month of days as a histogram", () => {
  it("starts at the first bin that has a day and ends at the last", () => {
    expect(histogramOf([20.1, 20.4, 21.7], 0.5, [-30, 35])).toEqual([20, 2, 0, 0, 1]);
  });

  it("puts a value on a bin's edge in the bin that starts there, whatever floating point says", () => {
    // 20.0 / 0.5 is 39.99999999999999 on the way there.
    expect(histogramOf([20.0], 0.5, [-30, 35])).toEqual([20, 1]);
    expect(histogramOf([19.9], 0.5, [-30, 35])).toEqual([19.5, 1]);
  });

  it("loses no day: a value beyond the range is counted at its end", () => {
    expect(histogramOf([300], 0.5, [0, 250])).toEqual([249.5, 1]);
    expect(histogramOf([-40], 0.5, [-30, 35])).toEqual([-30, 1]);
  });

  it("is nothing at all when there was no day", () => {
    expect(histogramOf([], 0.5, [0, 250])).toBeNull();
  });
});

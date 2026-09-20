import { describe, expect, it } from "vitest";
import { countDays } from "./countDays";

describe("days on one side of a threshold, from a histogram", () => {
  const month = [19, 3, 4, 5, 2]; // 19.0–19.5: 3 days, 19.5–20: 4, 20–20.5: 5, 20.5–21: 2

  it("counts the days at or above it exactly, when the threshold is a bin's edge", () => {
    expect(countDays(month, { threshold: 20, atLeast: true }, 0.5)).toBe(7);
    expect(countDays(month, { threshold: 19, atLeast: true }, 0.5)).toBe(14);
  });

  it("counts the days strictly below it, which is every other day", () => {
    expect(countDays(month, { threshold: 20, atLeast: false }, 0.5)).toBe(7);
    expect(countDays(month, { threshold: 25, atLeast: false }, 0.5)).toBe(14);
  });

  it("is zero for a month nobody measured", () => {
    expect(countDays(null, { threshold: 20, atLeast: true }, 0.5)).toBe(0);
  });
});

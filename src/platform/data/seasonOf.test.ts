import { describe, expect, it } from "vitest";
import { SEASON_ORDER } from "./SEASON_ORDER";
import { seasonOf } from "./seasonOf";

describe("the season a month falls in", () => {
  it("is counted in whole months, winter from December to February", () => {
    expect([12, 1, 2, 3, 5, 6, 8, 9, 11].map(seasonOf)).toEqual(["winter", "winter", "winter", "spring", "spring", "summer", "summer", "autumn", "autumn"]);
  });

  it("follows the order the seasons are named in, through the year from January", () => {
    expect([...new Set(Array.from({ length: 12 }, (_, month) => seasonOf(month + 1)))]).toEqual(SEASON_ORDER);
  });
});

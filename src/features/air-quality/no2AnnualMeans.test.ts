import { describe, expect, it } from "vitest";
import { aStation, flatSums } from "./aStation";
import { no2AnnualMeans } from "./no2AnnualMeans";

describe("the mean of each year", () => {
  it("is one figure a year, oldest first, over the days asked for", () => {
    const station = aStation({
      "2020": { workdays: flatSums(20, 21), weekends: flatSums(10, 9) },
      "2019": { workdays: flatSums(60, 21), weekends: flatSums(30, 9) },
    });
    expect(no2AnnualMeans(station, "workdays").map(({ year, mean }) => [year, mean])).toEqual([
      [2019, 60],
      [2020, 20],
    ]);
    expect(no2AnnualMeans(station, "all")[0]?.mean).toBeCloseTo((60 * 21 + 30 * 9) / 30);
  });

  it("says how much of the year was measured, because a mean of one winter is not a year", () => {
    const winter = flatSums(80, 30);
    const onlyJanuary = {
      sums: winter.sums.map((month, m) => (m === 0 ? month : month.map(() => 0))),
      counts: winter.counts.map((month, m) => (m === 0 ? month : month.map(() => 0))),
    };
    const station = aStation({ "2019": { workdays: onlyJanuary, weekends: flatSums(0, 0) } });
    const [year] = no2AnnualMeans(station, "all");
    expect(year?.mean).toBe(80);
    expect(year?.measured).toBeCloseTo((30 * 24) / (365 * 24));
  });

  it("measures a leap year against 366 days", () => {
    const station = aStation({ "2020": { workdays: flatSums(10, 30.5), weekends: flatSums(0, 0) } });
    expect(no2AnnualMeans(station, "all")[0]?.measured).toBeCloseTo(1);
  });
});

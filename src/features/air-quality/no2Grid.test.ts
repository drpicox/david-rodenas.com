import { describe, expect, it } from "vitest";
import { aStation, flatSums } from "./aStation";
import { no2Grid } from "./no2Grid";

describe("the mean by hour of the day and month of the year", () => {
  const station = aStation({
    "2019": { workdays: flatSums(60, 20), weekends: flatSums(30, 10) },
    "2020": { workdays: flatSums(20, 20), weekends: flatSums(10, 10) },
  });

  it("is twenty-four rows of twelve months", () => {
    const grid = no2Grid(station, { from: 2019, to: 2019, days: "workdays" });
    expect(grid).toHaveLength(24);
    expect(grid.every((row) => row.length === 12)).toBe(true);
    expect(grid[8]?.[0]).toEqual({ mean: 60, count: 20 });
  });

  it("weighs every measurement the same, so a long month of workdays outweighs its weekends", () => {
    const grid = no2Grid(station, { from: 2019, to: 2019, days: "all" });
    expect(grid[0]?.[0]?.mean).toBeCloseTo((60 * 20 + 30 * 10) / 30);
  });

  it("averages over the years asked for and no others", () => {
    expect(no2Grid(station, { from: 2019, to: 2020, days: "workdays" })[0]?.[0]).toEqual({ mean: 40, count: 40 });
    expect(no2Grid(station, { from: 2020, to: 2030, days: "weekends" })[0]?.[0]).toEqual({ mean: 10, count: 10 });
  });

  it("says nothing, rather than zero, where nothing was measured", () => {
    expect(no2Grid(station, { from: 1990, to: 1995, days: "all" })[0]?.[0]).toEqual({ mean: null, count: 0 });
  });

  it("reads the month across and the hour down: the file keeps them the other way round", () => {
    const march5am = flatSums(0, 0);
    const sums = march5am.sums.map((month, m) => month.map((_, h) => (m === 2 && h === 4 ? 99 : 0)));
    const counts = march5am.counts.map((month, m) => month.map((_, h) => (m === 2 && h === 4 ? 1 : 0)));
    const one = aStation({ "2019": { workdays: { sums, counts }, weekends: flatSums(0, 0) } });
    expect(no2Grid(one, { from: 2019, to: 2019, days: "all" })[4]?.[2]).toEqual({ mean: 99, count: 1 });
  });
});

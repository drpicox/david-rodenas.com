import { describe, expect, it } from "vitest";
import { aWeatherStation, steadyYear } from "./aWeatherStation";
import { daysPerYear } from "./daysPerYear";

const ALL = Array.from({ length: 12 }, (_, month) => month);
const SUMMER = [5, 6, 7];
const tropical = { variable: "tn", threshold: 20, atLeast: true } as const;

describe("the days of each year that answer the question", () => {
  const station = aWeatherStation({ "2023": steadyYear(2023, 21), "2024": steadyYear(2024, 19.5) });

  it("counts them year by year, oldest first", () => {
    const years = daysPerYear(station, { ...tropical, months: ALL });
    expect(years.map(({ year, days }) => [year, days])).toEqual([
      [2023, 365],
      [2024, 0],
    ]);
  });

  it("looks only at the months asked for, and keeps the rest of the year beside it", () => {
    const [year] = daysPerYear(station, { ...tropical, months: SUMMER });
    expect(year).toMatchObject({ days: 92, elsewhere: 365 - 92, measured: 92, expected: 92 });
  });

  it("gives every month its own count, for the calendar", () => {
    const [year] = daysPerYear(station, { ...tropical, months: ALL });
    expect(year?.months[1]).toEqual({ days: 28, measured: 28 });
  });

  it("calls a year whole only when nearly all of its days were measured", () => {
    const gappy = aWeatherStation({ "2023": steadyYear(2023, 21, [0]), "2024": steadyYear(2024, 21) });
    const [missingJanuary, whole] = daysPerYear(gappy, { ...tropical, months: ALL });
    expect(missingJanuary?.whole).toBe(false);
    expect(whole?.whole).toBe(true);
    // The same year is whole again when January is not among the months looked at.
    expect(daysPerYear(gappy, { ...tropical, months: SUMMER })[0]?.whole).toBe(true);
  });

  it("sums the year up the way the variable is summed up", () => {
    const [year] = daysPerYear(station, { ...tropical, months: SUMMER });
    expect(year?.summary).toBeCloseTo(21);
  });

  it("leaves out the years that never measured the variable", () => {
    expect(daysPerYear(station, { variable: "pp", threshold: 1, atLeast: true, months: ALL })).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { cadtepAnswer } from "./cadtepAnswer";
import { climateSeries } from "./climateSeries";
import { climateSeriesSource } from "./climateSeriesSource";

const DAY = 86_400_000;

/** Every day of a year, each with what the series measured on it. */
function wholeYear(year: number, measured: (date: string) => readonly [pp: number, tx: number, tn: number]) {
  const days = (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / DAY;
  return Array.from({ length: days }, (_, day) => {
    const date = new Date(Date.UTC(year, 0, 1) + day * DAY).toISOString().slice(0, 10);
    return [date, ...measured(date)] as const;
  });
}

/** What the Meteocat serves for each of the series, all with the same days. */
const answersWith = (days: Parameters<typeof cadtepAnswer>[1]) => climateSeries.map((series) => cadtepAnswer(series.name, days));

describe("the Meteocat's long series, from its files to the site's", () => {
  it("asks for the file of each series, which holds every year of it", () => {
    expect(climateSeriesSource.requestsFor(1950, new Date("2026-10-08"))).toEqual(
      climateSeries.map((series) => `https://static-m.meteo.cat/content/climatologia/series-climatiques/${series.code}d.txt`),
    );
  });

  it("keeps a year as the network's stations are kept: each month a histogram of its days, of the lowest temperature, the highest and the rain", () => {
    const august = (date: string) => date.slice(5, 7) === "08";
    const files = climateSeriesSource.withYear({}, 1950, answersWith(wholeYear(1950, (date) => (august(date) ? [0, 30.2, 20.7] : [1.5, 15, 8]))));
    const year = files["baic0008.json"]?.years["1950"];
    expect(year?.tn?.months[7]).toEqual([20.5, 31]);
    expect(year?.tx?.months[0]).toEqual([15, 31]);
    expect(year?.pp?.summaries[0]).toBe(46.5);
    expect(year?.tn?.record).toEqual([20.7, "1950-08-01", 8, "1950-01-01"]);
    expect(year?.pi).toBeUndefined();
    expect(files["baic0008.json"]).toMatchObject({ code: "baic0008", municipality: "Barcelona", altitude: 412 });
  });

  it("adds the year to what each file held", () => {
    const first = climateSeriesSource.withYear({}, 1950, answersWith([...wholeYear(1950, () => [0, 14, 7]), ...wholeYear(1951, () => [0, 15, 8])]));
    const second = climateSeriesSource.withYear(first, 1951, answersWith([...wholeYear(1950, () => [0, 14, 7]), ...wholeYear(1951, () => [0, 15, 8])]));
    expect(Object.keys(second["baic0007.json"]?.years ?? {})).toEqual(["1950", "1951"]);
  });

  it("waits for a year a series does not reach yet, and refuses one it holds only part of", () => {
    expect(() => climateSeriesSource.withYear({}, 2026, answersWith(wholeYear(2025, () => [0, 14, 7])))).toThrow(/does not reach 2026 yet/);
    expect(() => climateSeriesSource.withYear({}, 2025, answersWith(wholeYear(2025, () => [0, 14, 7]).slice(0, 200)))).toThrow(/200 days of 2025/);
  });

  it("has no year still running: the Meteocat adds to its series a whole year at a time", () => {
    expect(climateSeriesSource.soFar).toBeUndefined();
  });
});

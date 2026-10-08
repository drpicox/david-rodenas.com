import { describe, expect, it } from "vitest";
import { Site } from "../../platform/content/Site";
import { aWeatherStation } from "./aWeatherStation";
import { climateSeries } from "./climateSeries";
import { hotNightsTool } from "./hotNightsTool";
import { steadyYear } from "./steadyYear";

const site = new Site([
  { file: "index.md", markdown: "# Home\n" },
  { file: "projects/hot-nights.md", markdown: "---\ntitle: Hot nights\n---\n# Hot nights\n\n::weather\n" },
]);
const index = { attribution: "Servei Meteorològic de Catalunya (XEMA).", dataset: "https://example.test", years: [2020, 2025], refreshed: "2026-09-20" };
// Badalona warms by a degree at the turn of the record; the Raval is torrid all along.
const badalona = { ...aWeatherStation({ "2020": steadyYear(2020, 24.5), "2021": steadyYear(2021, 24.5), "2022": steadyYear(2022, 24.5), "2023": steadyYear(2023, 25.5), "2024": steadyYear(2024, 25.5), "2025": steadyYear(2025, 25.5) }), code: "WU", name: "Badalona - Museu" };
const raval = { ...aWeatherStation({ "2024": steadyYear(2024, 26), "2025": steadyYear(2025, 26) }), code: "X4", name: "Barcelona - el Raval" };
const running = { year: 2026, through: "2026-09-30", refreshed: "2026-10-01", files: { "WU.json": { ...badalona, years: { "2026": steadyYear(2026, 25.5, [9, 10, 11]) } } } };

function served(files: Record<string, unknown>) {
  return (path: string) => (path in files ? Promise.resolve(JSON.stringify(files[path])) : Promise.reject(new Error(`${path}: 404`)));
}
const seriesIndex = { attribution: "Servei Meteorològic de Catalunya, CADTEP (Prohom and others, 2023).", dataset: "https://example.test", years: [1950, 2025], refreshed: "2026-10-08" };
// The Fabra's long series has a torrid night a year in its first half and two in its second.
const fabra = { ...aWeatherStation({ "1950": steadyYear(1950, 12), "1951": steadyYear(1951, 12), "2024": steadyYear(2024, 12), "2025": steadyYear(2025, 12) }), code: "baic0008", name: "Barcelona - Observatori Fabra, since 1950" };
const longSeries = Object.fromEntries(climateSeries.map((series) => [`/data/climate-series/${series.code}.json`, { ...fabra, code: series.code, name: series.name }]));
const read = served({
  "/data/weather/index.json": index,
  "/data/weather/WU.json": badalona,
  "/data/weather/X4.json": raval,
  "/data/weather/running.json": running,
  "/data/climate-series/index.json": seriesIndex,
  ...longSeries,
});
const ask = async (input: Record<string, unknown>) => (await hotNightsTool.answer(input, { site, origin: "https://david-rodenas.com", read })) as { summary: string; data: Record<string, unknown>; [key: string]: unknown };

describe("counting days at the Meteocat's stations, for an agent", () => {
  it("counts the days of a kind year by year at a station, and holds the two halves of its record against each other", async () => {
    const { data } = await ask({ station: "WU", kind: "torrid-nights" });
    expect(data["question"]).toBe("days with a daily minimum of 25 °C or more, whole year");
    expect(data["years"]).toContainEqual({ year: 2020, days: 0, whole: true, measuredDays: 366, expectedDays: 366 });
    expect(data["years"]).toContainEqual({ year: 2025, days: 365, whole: true, measuredDays: 365, expectedDays: 365 });
    expect(data["halves"]).toEqual([
      { from: 2020, to: 2022, years: 3, daysPerYear: 0 },
      { from: 2023, to: 2025, years: 3, daysPerYear: 365.3 },
    ]);
    expect(data["changeDaysPerYear"]).toBe(365.3);
  });

  it("counts the year still running too, marked with the last day it reaches and kept out of the halves", async () => {
    const { data, summary } = await ask({ station: "WU", kind: "torrid-nights" });
    expect(data["years"]).toContainEqual({ year: 2026, days: 273, whole: false, measuredDays: 273, expectedDays: 365, soFarThrough: "2026-09-30" });
    expect(summary).toContain("2026 so far, to 30 September: 273");
    expect((data["halves"] as { to: number }[])[1]?.to).toBe(2025);
  });

  it("moves the threshold, and looks at the months asked for, January being 1", async () => {
    const { data } = await ask({ station: "WU", kind: "torrid-nights", threshold: 25.5, months: [7] });
    expect(data["question"]).toBe("days with a daily minimum of 25.5 °C or more, July to July");
    expect(data["years"]).toContainEqual(expect.objectContaining({ year: 2025, days: 31 }));
  });

  it("gives only the years asked for, and the halves of the whole record all the same", async () => {
    const { data } = await ask({ station: "WU", kind: "torrid-nights", from: 2024, to: 2025 });
    expect((data["years"] as { year: number }[]).map(({ year }) => year)).toEqual([2024, 2025]);
    expect((data["halves"] as { from: number }[])[0]?.from).toBe(2020);
  });

  it("puts every station side by side when asked for all, the most days a year first", async () => {
    const all = read;
    const { data, summary } = (await hotNightsTool.answer({ station: "all", kind: "torrid-nights" }, { site, origin: "", read: all })) as { summary: string; data: { stations: { code: string; daysPerYearRecently: number }[] } };
    expect(data.stations.map(({ code }) => code)).toEqual(["X4", "WU"]);
    expect(summary).toMatch(/^Most days with a daily minimum of 25 °C or more, whole year, in the second half of each record: Barcelona - el Raval/);
  });

  it("counts in one of the Meteocat's long series as at a station, credited to the series, which have no year still running", async () => {
    const answer = await ask({ station: "baic0008", kind: "tropical-nights", threshold: 12 });
    expect(answer).toMatchObject({ source: "Servei Meteorològic de Catalunya, CADTEP (Prohom and others, 2023).", refreshed: "2026-10-08", show: { app: "weather", values: { station: "baic0008" } } });
    expect(answer.data["station"]).toMatchObject({ code: "baic0008", name: "Barcelona - Observatori Fabra, since 1950" });
    expect((answer.data["halves"] as { from: number; to: number }[]).map(({ from, to }) => [from, to])).toEqual([
      [1950, 1951],
      [2024, 2025],
    ]);
  });

  it("puts every long series side by side when asked for all of them, and only them", async () => {
    const { data } = (await ask({ station: "all-series", kind: "frost-days" })) as unknown as { data: { stations: { code: string }[] } };
    expect(data.stations.map(({ code }) => code).sort()).toEqual(climateSeries.map(({ code }) => code).sort());
  });

  it("says whose measurements they are and how fresh the copy is, and where the page is", async () => {
    expect(await ask({ station: "WU" })).toMatchObject({ source: "Servei Meteorològic de Catalunya (XEMA).", refreshed: "2026-10-01", route: "/projects/hot-nights/" });
  });

  it("has the page's figure to show the reader, asked the same", async () => {
    expect(await ask({ station: "WU", kind: "torrid-nights", months: [6, 7, 8] })).toMatchObject({ show: { app: "weather", values: { station: "WU", kind: "torrid-nights", threshold: 25, months: "5,6,7" } } });
    expect(await ask({ station: "all" })).not.toHaveProperty("show");
  });

  it("refuses what it cannot count, and says why", async () => {
    expect(await ask({ station: "Mars" })).toEqual({ refused: "station: Mars is not one of WU, X4, X8, D5, UP, XF, XJ, XE, VK, all, baic0008, baic0007, baic0019, baic0009, baic0012, baic0005 or all-series" });
    expect(await ask({ kind: "snow" })).toEqual({ refused: "kind: snow is not one of torrid-nights, tropical-nights, hot-days, torrid-days, frost-days, rainy-days, heavy-rain or downpours" });
    expect(await ask({ months: [0] })).toEqual({ refused: "months: 0 is not a month from 1 to 12" });
    expect(await ask({ threshold: "hot" })).toEqual({ refused: "threshold: hot is not a number" });
  });
});

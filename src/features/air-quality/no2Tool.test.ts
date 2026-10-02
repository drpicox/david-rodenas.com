import { describe, expect, it } from "vitest";
import { Site } from "../../platform/content/Site";
import { aStation } from "./aStation";
import { flatSums } from "./flatSums";
import { no2Tool } from "./no2Tool";

const site = new Site([
  { file: "index.md", markdown: "# Home\n" },
  { file: "projects/no2.md", markdown: "---\ntitle: NO2\n---\n# NO2\n\n::no2\n" },
]);
const index = { attribution: "Generalitat de Catalunya.", dataset: "https://example.test", years: [2019, 2020], refreshed: "2026-09-20" };
// Poblenou halves from one year to the next; Eixample, a street of traffic, stays high.
const poblenou = { ...aStation({ "2019": { workdays: flatSums(60, 20), weekends: flatSums(30, 8) }, "2020": { workdays: flatSums(20, 20), weekends: flatSums(10, 8) } }), code: "08019004", name: "Barcelona (Poblenou)" };
const eixample = { ...aStation({ "2019": { workdays: flatSums(80, 20), weekends: flatSums(70, 8) }, "2020": { workdays: flatSums(70, 20), weekends: flatSums(60, 8) } }), code: "08019043", name: "Barcelona (Eixample)" };
const running = { year: 2021, through: "2021-09-28", refreshed: "2021-09-30", files: { "08019004.json": { ...poblenou, years: { "2021": { workdays: flatSums(30, 20), weekends: flatSums(20, 8) } } } } };

const files: Record<string, unknown> = { "/data/no2/index.json": index, "/data/no2/08019004.json": poblenou, "/data/no2/08019043.json": eixample, "/data/no2/running.json": running };
const read = (path: string) => (path in files ? Promise.resolve(JSON.stringify(files[path])) : Promise.reject(new Error(`${path}: 404`)));
type Answer = { summary: string; data: Record<string, unknown>; [key: string]: unknown };
const ask = async (input: Record<string, unknown>) => (await no2Tool.answer(input, { site, origin: "https://david-rodenas.com", read })) as Answer;

describe("NO2 at the Generalitat's measuring points, for an agent", () => {
  it("gives the mean of every year at a station, the year still running marked with the day it reaches", async () => {
    const { data } = await ask({ station: "08019004" });
    expect(data["annualMeans"]).toEqual([
      { year: 2019, meanMicrogramsPerM3: 51.4, measuredShare: expect.any(Number) },
      { year: 2020, meanMicrogramsPerM3: 17.1, measuredShare: expect.any(Number) },
      { year: 2021, meanMicrogramsPerM3: 27.1, measuredShare: expect.any(Number), soFarThrough: "2021-09-28" },
    ]);
  });

  it("gives the mean of the years and days asked for, by hour of the day and month of the year, and where it is highest and lowest", async () => {
    const { data } = await ask({ station: "08019004", from: 2019, to: 2019, days: "workdays" });
    expect(data["meanMicrogramsPerM3"]).toBe(60);
    expect((data["byHourAndMonth"] as (number | null)[][])[8]?.[0]).toBe(60);
    expect(data["highest"]).toMatchObject({ meanMicrogramsPerM3: 60 });
  });

  it("answers one hour of one month, the hours numbered 1 to 24 as the network numbers them", async () => {
    const { data, summary } = await ask({ station: "08019004", from: 2019, to: 2020, month: 1, hour: 9 });
    expect(data["cell"]).toEqual({ month: 1, hour: 9, meanMicrogramsPerM3: 34.3, measurements: expect.any(Number) });
    expect(summary).toContain("hour 09 of January: 34.3 µg/m³");
    expect(data).not.toHaveProperty("byHourAndMonth");
  });

  it("puts every station side by side when asked for all, the highest last whole year first", async () => {
    const { data, summary } = await ask({ station: "all" });
    expect((data["stations"] as { code: string }[]).map(({ code }) => code)).toEqual(["08019043", "08019004"]);
    expect(summary).toMatch(/^The mean of 2020, every day of the week: Barcelona \(Eixample\) 67\.1 µg\/m³; Barcelona \(Poblenou\) 17\.1 µg\/m³\./);
  });

  it("says whose measurements they are, how fresh the copy is, and where the page is", async () => {
    expect(await ask({ station: "08019004" })).toMatchObject({ source: "Generalitat de Catalunya.", refreshed: "2021-09-30", route: "/projects/no2/" });
  });

  it("has the page's figure to show the reader, asked the same", async () => {
    expect(await ask({ station: "08019004", from: 2019, to: 2020, days: "weekends" })).toMatchObject({ show: { app: "no2", values: { station: "08019004", from: 2019, to: 2020, days: "weekends" } } });
    expect(await ask({ station: "all" })).not.toHaveProperty("show");
  });

  it("refuses what it cannot answer, and says why", async () => {
    expect((await ask({ station: "Madrid" })).refused).toMatch(/^station: Madrid is not one of 08019004, /);
    expect(await ask({ days: "holidays" })).toEqual({ refused: "days: holidays is not one of all, workdays or weekends" });
    expect(await ask({ month: 13 })).toEqual({ refused: "month: 13 is not a month from 1 to 12" });
    expect(await ask({ hour: 0 })).toEqual({ refused: "hour: 0 is not an hour from 1 to 24" });
  });
});

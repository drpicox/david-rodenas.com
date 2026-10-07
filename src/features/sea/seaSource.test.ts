import { describe, expect, it } from "vitest";
import type { SeaFile } from "./SeaPoint";
import { seaAnswer } from "./seaAnswer";
import { seaSource } from "./seaSource";

const DAY = 86_400_000;
const daysIn = (year: number) => (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / DAY;
/** A year's answers as the server gives them, a quarter at a time: the day of the year, plus a tenth of the latitude, as the value. */
const answers = (year: number, days = daysIn(year), skip = -1) =>
  Array.from({ length: Math.ceil(days / 92) }, (_, block) => {
    const from = block * 92;
    const count = Math.min(92, days - from);
    return seaAnswer(year, from, count, (day, lat) => (day === skip ? null : day + lat / 10 + 0.004));
  });
const blocks = (urls: readonly string[]) => urls.map((url) => decodeURIComponent(url.slice(url.indexOf("?") + 1)));

describe("the sea's temperature, kept a year at a time", () => {
  it("asks for a finished year a quarter at a time, every point in one box of cells", () => {
    const urls = seaSource.requestsFor(2025, new Date("2026-03-01T12:00:00Z"));
    expect(urls[0]).toMatch(/^https:\/\/psl\.noaa\.gov\/thredds\/dodsC\/Datasets\/noaa\.oisst\.v2\.highres\/sst\.day\.mean\.2025\.nc\.ascii\?sst%5B0:1:91%5D%5B522:1:528%5D%5B3:1:13%5D$/);
    expect(blocks(urls)).toEqual(["sst[0:1:91][522:1:528][3:1:13]", "sst[92:1:183][522:1:528][3:1:13]", "sst[184:1:275][522:1:528][3:1:13]", "sst[276:1:364][522:1:528][3:1:13]"]);
  });

  it("asks for the year still running up to three days ago, the newest the server has", () => {
    expect(blocks(seaSource.requestsFor(2026, new Date("2026-10-07T12:00:00Z"))).at(-1)).toBe("sst[276:1:276][522:1:528][3:1:13]");
  });

  it("waits for a finished year until the middle of January, while its last days are still revised", () => {
    expect(() => seaSource.requestsFor(2025, new Date("2026-01-10T12:00:00Z"))).toThrow("revised");
  });

  it("keeps a value a day for each point, beside the years it held", () => {
    const held: SeaFile = { code: "barcelona", name: "Off Barcelona", lat: 41.375, lon: 2.375, years: { 2024: [1] } };
    const files = seaSource.withYear({ "barcelona.json": held }, 2025, answers(2025, 365, 40));
    const barcelona = files["barcelona.json"];
    expect(Object.keys(barcelona?.years ?? {})).toEqual(["2024", "2025"]);
    expect(barcelona?.years["2025"]).toHaveLength(365);
    expect(barcelona?.years["2025"]?.[0]).toBe(4.14);
    expect(barcelona?.years["2025"]?.[40]).toBeNull();
    expect(files["estartit.json"]?.years["2025"]?.[364]).toBe(368.22);
  });

  it("refuses a year that is not whole, or whose days do not follow one another", () => {
    expect(() => seaSource.withYear({}, 2025, answers(2025, 300))).toThrow("2025 has 300 days, not 365");
    const [first = "", second = ""] = answers(2025);
    expect(() => seaSource.withYear({}, 2025, [second, first])).toThrow("not in order");
  });

  it("keeps the year still running as far as it goes", () => {
    const { files, through } = seaSource.soFar?.(2026, answers(2026, 277)) ?? { files: {}, through: "" };
    expect(through).toBe("2026-10-04");
    expect(files["ebre.json"]?.years["2026"]).toHaveLength(277);
  });
});

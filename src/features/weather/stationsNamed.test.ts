import { describe, expect, it } from "vitest";
import { climateSeries } from "./climateSeries";
import { stationsNamed } from "./stationsNamed";
import { weatherStations } from "./weatherStations";

describe("the stations a question names", () => {
  it("is one station of the network, kept with the year still running beside it", () => {
    expect(stationsNamed("WU")).toMatchObject({ codes: ["WU"], group: { directory: "/data/weather", running: true } });
  });

  it("is one of the long series, kept apart, a whole year at a time", () => {
    expect(stationsNamed("baic0008")).toMatchObject({ codes: ["baic0008"], group: { directory: "/data/climate-series", running: false } });
  });

  it("is every station of the network, or every long series, but never the two mixed: their records are not of the same years", () => {
    expect(stationsNamed("all")?.codes).toEqual(weatherStations.map(({ code }) => code));
    expect(stationsNamed("all-series")?.codes).toEqual(climateSeries.map(({ code }) => code));
  });

  it("is nothing at all for a name that is none of them", () => {
    expect(stationsNamed("XX")).toBeUndefined();
  });
});

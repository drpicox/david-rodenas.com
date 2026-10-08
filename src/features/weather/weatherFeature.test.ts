import { describe, expect, it } from "vitest";
import { climateSeriesSource } from "./climateSeriesSource";
import { weatherFeature } from "./weatherFeature";
import { weatherSource } from "./weatherSource";

describe("the weather, as the site keeps it", () => {
  it("keeps the network's stations and the Meteocat's long series, each from a source of its own", () => {
    expect(weatherFeature.sources).toEqual([weatherSource, climateSeriesSource]);
  });

  it("brings the page's figure, a tool to ask it, and the stations and series as the sources of a blueprint", () => {
    expect(Object.keys(weatherFeature.apps ?? {})).toEqual(["weather"]);
    expect(Object.keys(weatherFeature.stills ?? {})).toEqual(["weather"]);
    expect(weatherFeature.tools?.map((tool) => tool.name)).toEqual(["hot-nights"]);
    expect(weatherFeature.nodes?.map((kind) => kind.name)).toEqual(["weather-months", "weather-days", "weather-stations"]);
  });
});

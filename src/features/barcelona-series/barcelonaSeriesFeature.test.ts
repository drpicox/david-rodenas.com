import { describe, expect, it } from "vitest";
import { barcelonaRainSource } from "./barcelonaRainSource";
import { barcelonaSeriesFeature } from "./barcelonaSeriesFeature";
import { barcelonaSource } from "./barcelonaSource";
import { barcelonaNodes } from "./nodes/barcelonaNodes";

describe("Barcelona's series since 1780, as the site keeps it", () => {
  it("brings the open data it keeps, the temperatures and the rain, and the series as sources of a blueprint", () => {
    expect(barcelonaSeriesFeature.sources).toEqual([barcelonaSource, barcelonaRainSource]);
    expect(barcelonaSeriesFeature.nodes).toEqual(barcelonaNodes);
  });
});

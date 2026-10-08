import { describe, expect, it } from "vitest";
import { barcelonaSeriesFeature } from "./barcelonaSeriesFeature";
import { barcelonaSource } from "./barcelonaSource";
import { barcelonaNodes } from "./nodes/barcelonaNodes";

describe("Barcelona's series since 1780, as the site keeps it", () => {
  it("brings the open data it keeps, and the series as a source of a blueprint", () => {
    expect(barcelonaSeriesFeature.sources).toEqual([barcelonaSource]);
    expect(barcelonaSeriesFeature.nodes).toEqual(barcelonaNodes);
  });
});

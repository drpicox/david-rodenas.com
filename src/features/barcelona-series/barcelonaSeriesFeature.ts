import type { Feature } from "../../platform/plugin/Feature";
import { barcelonaSource } from "./barcelonaSource";
import { barcelonaNodes } from "./nodes/barcelonaNodes";

/** Barcelona's mean temperature month by month since 1780, the Meteocat's longest series: the open data it keeps, and the series as nodes of a blueprint. */
export const barcelonaSeriesFeature: Feature = {
  name: "barcelona-series",
  sources: [barcelonaSource],
  nodes: barcelonaNodes,
};

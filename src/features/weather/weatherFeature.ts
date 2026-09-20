import type { Feature } from "../../platform/plugin/Feature";
import { weatherSource } from "./weatherSource";

/** Days over a threshold, year by year, at a few of the Meteocat's stations: hot nights, hot days, rain. */
export const weatherFeature: Feature = {
  name: "weather",
  sources: [weatherSource],
};

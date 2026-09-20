import type { Feature } from "../../platform/plugin/Feature";
import { mountWeather } from "./browser/mountWeather";
import { weatherSource } from "./weatherSource";
import { weatherStill } from "./weatherStill";

/** Days over a threshold, year by year, at a few of the Meteocat's stations: hot nights, hot days, rain. */
export const weatherFeature: Feature = {
  name: "weather",
  apps: { weather: mountWeather },
  stills: { weather: weatherStill },
  sources: [weatherSource],
};

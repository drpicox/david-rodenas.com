import type { Feature } from "../../platform/plugin/Feature";
import { mountWeather } from "./browser/mountWeather";
import { climateSeriesSource } from "./climateSeriesSource";
import { hotNightsTool } from "./hotNightsTool";
import { weatherNodes } from "./nodes/weatherNodes";
import { weatherSource } from "./weatherSource";
import { weatherStill } from "./weatherStill";

/** Days over a threshold, year by year, at a few of the Meteocat's stations and in its long series since 1950: hot nights, hot days, rain — a page, a tool to ask it, and both as nodes of a blueprint. */
export const weatherFeature: Feature = {
  name: "weather",
  apps: { weather: mountWeather },
  stills: { weather: weatherStill },
  sources: [weatherSource, climateSeriesSource],
  tools: [hotNightsTool],
  nodes: weatherNodes,
};

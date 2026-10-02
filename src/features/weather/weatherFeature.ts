import type { Feature } from "../../platform/plugin/Feature";
import { mountWeather } from "./browser/mountWeather";
import { hotNightsTool } from "./hotNightsTool";
import { weatherSource } from "./weatherSource";
import { weatherStill } from "./weatherStill";

/** Days over a threshold, year by year, at a few of the Meteocat's stations: hot nights, hot days, rain — a page, and a tool to ask it. */
export const weatherFeature: Feature = {
  name: "weather",
  apps: { weather: mountWeather },
  stills: { weather: weatherStill },
  sources: [weatherSource],
  tools: [hotNightsTool],
};

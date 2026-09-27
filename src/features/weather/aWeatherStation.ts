import type { WeatherStation, WeatherYear } from "./WeatherStation";

/** A station made for a test, with the years it is handed. */
export function aWeatherStation(years: Record<string, WeatherYear>): WeatherStation {
  return { code: "ZZ", name: "Somewhere", municipality: "Nowhere", altitude: 100, setting: "a field", years };
}

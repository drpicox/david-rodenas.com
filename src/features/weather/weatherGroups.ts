import { climateSeries } from "./climateSeries";
import type { WeatherStation } from "./WeatherStation";
import { weatherStations } from "./weatherStations";

/** Stations kept together: where their files are served from, whether the year still running is kept beside them, and how a list names them and all of them. */
export interface WeatherGroup {
  readonly label: string;
  readonly directory: string;
  readonly running: boolean;
  /** What a question calls every station of the group at once, and what a list says for it. */
  readonly every: { readonly name: string; readonly label: string };
  readonly stations: readonly Omit<WeatherStation, "years">[];
}

/**
 * The network's automatic stations, with the year still running, and the
 * Meteocat's long series since 1950, a whole year at a time: kept apart, each
 * with its own index, because they come from two of its sources and are
 * credited to each — and asked about apart, because their records are not of
 * the same years. The first station of the first group is the page's.
 */
export const weatherGroups: readonly WeatherGroup[] = [
  { label: "Automatic stations", directory: "/data/weather", running: true, every: { name: "all", label: "every station" }, stations: weatherStations },
  { label: "Long series, since 1950", directory: "/data/climate-series", running: false, every: { name: "all-series", label: "every long series" }, stations: climateSeries },
];

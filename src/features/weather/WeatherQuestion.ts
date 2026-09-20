import type { Threshold } from "./countDays";
import type { WeatherVariable } from "./WeatherStation";

/** What is being counted: days of which variable, on which side of what, in which months (0 is January). */
export interface WeatherQuestion extends Threshold {
  readonly variable: WeatherVariable;
  readonly months: readonly number[];
}

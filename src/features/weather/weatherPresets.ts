import type { WeatherQuestion } from "./WeatherQuestion";

export interface WeatherPreset extends Omit<WeatherQuestion, "months"> {
  readonly id: string;
  /** What the days are called, in the plural. */
  readonly name: string;
}

/**
 * Shortcuts, not definitions: the names are common usage rather than anything
 * the Meteocat decrees, and the threshold can be moved off any of them. Frost
 * is "below 0" and not "0 or below" because only the first can be counted
 * exactly from bins that are closed on the left.
 */
export const weatherPresets: readonly WeatherPreset[] = [
  { id: "tropical-nights", name: "tropical nights", variable: "tn", atLeast: true, threshold: 20 },
  { id: "torrid-nights", name: "torrid nights", variable: "tn", atLeast: true, threshold: 25 },
  { id: "hot-days", name: "hot days", variable: "tx", atLeast: true, threshold: 30 },
  { id: "torrid-days", name: "torrid days", variable: "tx", atLeast: true, threshold: 35 },
  { id: "frost-days", name: "frost days", variable: "tn", atLeast: false, threshold: 0 },
  { id: "rainy-days", name: "rainy days", variable: "pp", atLeast: true, threshold: 1 },
  { id: "heavy-rain", name: "days of heavy rain", variable: "pp", atLeast: true, threshold: 20 },
  { id: "downpours", name: "days with a downpour", variable: "pi", atLeast: true, threshold: 10 },
];

import type { WeatherQuestion } from "./WeatherQuestion";
import { weatherPresets } from "./weatherPresets";

const [first] = weatherPresets;

/** The first kind of day in the list, over the whole year: a night in May or October that does not cool down counts, and says the most. */
export const firstQuestion: WeatherQuestion = {
  variable: first!.variable,
  atLeast: first!.atLeast,
  threshold: first!.threshold,
  months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

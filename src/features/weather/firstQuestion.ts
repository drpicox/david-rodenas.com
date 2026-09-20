import type { WeatherQuestion } from "./WeatherQuestion";

/** Tropical nights, over the whole year: a night in May or October that does not cool down counts, and says the most. */
export const firstQuestion: WeatherQuestion = {
  variable: "tn",
  atLeast: true,
  threshold: 20,
  months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

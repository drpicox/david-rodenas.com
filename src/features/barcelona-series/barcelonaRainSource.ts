import { barcelonaSeriesSource } from "./barcelonaSeriesSource";

/** Barcelona's rain month by month since 1786, which its paper calls the longest instrumental series of rain of the Iberian Peninsula: from the same page as the temperatures, credited to its own paper. */
export const barcelonaRainSource = barcelonaSeriesSource({
  name: "barcelona-rain",
  file: "PPT",
  kept: "rain.json",
  firstYear: 1786,
  measures: "the rain of every month, since 1786",
  attribution: "Servei Meteorològic de Catalunya: the series of rain of Barcelona since 1786 (Prohom, Barriendos and Sanchez-Lorenzo, 2015).",
});

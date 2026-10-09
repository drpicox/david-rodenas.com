import { barcelonaSeriesSource } from "./barcelonaSeriesSource";

/**
 * Barcelona's mean temperature month by month since 1780: the series the
 * Meteocat put together from the city's old observers and the Observatori
 * Fabra, checked and homogenised, to which it adds each year once it is over.
 */
export const barcelonaSource = barcelonaSeriesSource({
  name: "barcelona-series",
  file: "TM",
  kept: "temperature.json",
  firstYear: 1780,
  measures: "the mean temperature of every month, since 1780",
  attribution: "Servei Meteorològic de Catalunya: the climate series of Barcelona since 1780 (Prohom, Barriendos, Aguilar and Ripoll, 2012).",
});

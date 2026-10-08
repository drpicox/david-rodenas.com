import type { YearlySource } from "../../platform/data/YearlySource";
import type { BarcelonaSeries } from "./BarcelonaSeries";
import { barcelonaLinkOf } from "./barcelonaLinkOf";
import { monthlyMeansOf } from "./monthlyMeansOf";

const PAGE = "https://www.meteo.cat/wpweb/climatologia/dades-i-productes-climatics/serie-climatica-de-barcelona-des-de-1780/";
const FILE = "temperature.json";

/**
 * Barcelona's mean temperature month by month since 1780: the series the
 * Meteocat put together from the city's old observers and the Observatori
 * Fabra, checked and homogenised, to which it adds each year once it is
 * over. The file is named anew with every year added, so it is found from
 * the page that links to it; a year not in it yet is waited for.
 */
export const barcelonaSource: YearlySource<BarcelonaSeries> = {
  name: "barcelona-series",
  directory: "public/data/barcelona-series",
  firstYear: 1780,
  answers: "text",
  files: [FILE],
  about: {
    measures: "the mean temperature of every month, since 1780",
    series: "Barcelona, placed by the Meteocat at the Observatori Fabra: 41.41864 N, 2.12379 E, 411 m",
    attribution: "Servei Meteorològic de Catalunya: the climate series of Barcelona since 1780 (Prohom, Barriendos, Aguilar and Ripoll, 2012).",
    dataset: PAGE,
  },

  requestsFor() {
    return [PAGE];
  },

  follow: barcelonaLinkOf,

  withYear(files, year, answers) {
    const months = monthlyMeansOf(String(answers[0])).get(year);
    if (!months) throw new Error(`the series does not reach ${year} yet`);
    return { [FILE]: { years: { ...files[FILE]?.years, [year]: months } } };
  },
};

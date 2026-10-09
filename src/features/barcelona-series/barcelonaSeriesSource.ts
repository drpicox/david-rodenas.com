import type { YearlySource } from "../../platform/data/YearlySource";
import type { BarcelonaSeries } from "./BarcelonaSeries";
import { barcelonaLinkOf } from "./barcelonaLinkOf";
import { monthlyValuesOf } from "./monthlyValuesOf";

const PAGE = "https://www.meteo.cat/wpweb/climatologia/dades-i-productes-climatics/serie-climatica-de-barcelona-des-de-1780/";

export interface BarcelonaFile {
  /** The source's name, and the directory it is kept in. */
  readonly name: string;
  /** Which of the page's files: TM, the mean temperature; PPT, the rain. */
  readonly file: Parameters<typeof barcelonaLinkOf>[1];
  /** The file the site keeps it in. */
  readonly kept: string;
  readonly firstYear: number;
  readonly measures: string;
  /** Whom to credit, with the paper the Meteocat asks to be cited for it. */
  readonly attribution: string;
}

/**
 * One of Barcelona's series as a source of its own: asked of the Meteocat's
 * page, which stays put, and followed to the file the page links to this
 * year, which does not; kept a finished year at a time, twelve monthly values
 * a year, and a year not in the file yet waited for.
 */
export function barcelonaSeriesSource({ name, file, kept, firstYear, measures, attribution }: BarcelonaFile): YearlySource<BarcelonaSeries> {
  return {
    name,
    directory: `public/data/${name}`,
    firstYear,
    answers: "text",
    files: [kept],
    about: { measures, series: "Barcelona, placed by the Meteocat at the Observatori Fabra: 41.41864 N, 2.12379 E, 411 m", attribution, dataset: PAGE },
    requestsFor: () => [PAGE],
    follow: (page) => barcelonaLinkOf(page, file),
    withYear(files, year, answers) {
      const months = monthlyValuesOf(String(answers[0])).get(year);
      if (!months) throw new Error(`the series does not reach ${year} yet`);
      return { [kept]: { years: { ...files[kept]?.years, [year]: months } } };
    },
  };
}

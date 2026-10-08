import type { YearlySource } from "../../platform/data/YearlySource";
import { cadtepDaysOf, type CadtepDay } from "./cadtepDaysOf";
import { climateSeries } from "./climateSeries";
import { variableYearOf } from "./variableYearOf";
import type { WeatherStation, WeatherVariable, WeatherYear } from "./WeatherStation";
import { weatherVariables } from "./weatherVariables";

const FILES = "https://static-m.meteo.cat/content/climatologia/series-climatiques";
/** The series hold a day's rain, but not the most of it that fell in one hour. */
const KEPT: readonly Exclude<WeatherVariable, "pi">[] = ["tn", "tx", "pp"];

const daysIn = (year: number) => (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;

/** One year of a series as the site keeps a station's: whole, or not at all — a series has no holes, so a year with any is one still being written. */
function yearOf(name: string, days: readonly CadtepDay[], year: number): WeatherYear {
  const ofYear = days.filter(({ date }) => date.startsWith(`${year}-`));
  if (ofYear.length === 0) throw new Error(`${name} does not reach ${year} yet`);
  if (ofYear.length !== daysIn(year)) throw new Error(`${name} has ${ofYear.length} days of ${year}, not ${daysIn(year)}`);
  return Object.fromEntries(
    KEPT.flatMap((variable) => {
      const measured = ofYear.flatMap(({ date, [variable]: value }) => (value === null ? [] : [{ date, value }]));
      return measured.length > 0 ? [[variable, variableYearOf(measured, weatherVariables[variable])] as const] : [];
    }),
  );
}

/**
 * The Meteocat's long series of daily temperatures and rain, since 1950:
 * CADTEP, its climatologists' database, served as a file a series that holds
 * every year. A year arrives once the Meteocat has added it, some months
 * after it ends; until then the year is waited for, as any other is.
 */
export const climateSeriesSource: YearlySource<WeatherStation> = {
  name: "climate-series",
  directory: "public/data/climate-series",
  firstYear: 1950,
  answers: "text",
  files: climateSeries.map((series) => `${series.code}.json`),
  about: {
    measures: "daily minimum and maximum temperature and daily rain, checked and homogenised",
    network: "CADTEP, the Meteocat's long series since 1950",
    attribution: "Servei Meteorològic de Catalunya, CADTEP (Prohom and others, 2023).",
    dataset: "https://www.meteo.cat/wpweb/climatologia/dades-i-productes-climatics/series-climatiques-des-de-1950/",
    stations: climateSeries,
  },

  requestsFor() {
    return climateSeries.map((series) => `${FILES}/${series.code}d.txt`);
  },

  withYear(files, year, answers) {
    return Object.fromEntries(
      climateSeries.map((series, index) => {
        const file = `${series.code}.json`;
        const days = cadtepDaysOf(String(answers[index]));
        return [file, { ...series, years: { ...files[file]?.years, [year]: yearOf(series.name, days, year) } }];
      }),
    );
  },
};

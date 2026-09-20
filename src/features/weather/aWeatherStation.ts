import type { WeatherStation, WeatherYear } from "./WeatherStation";

/** A year in which every day of every month had the same minimum: a station made for a test. */
export function steadyYear(year: number, minimum: number, missingMonths: readonly number[] = []): WeatherYear {
  const daysIn = (month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const months = Array.from({ length: 12 }, (_, month) => (missingMonths.includes(month) ? null : [minimum, daysIn(month)]));
  return { tn: { months, summaries: months.map((month) => (month ? minimum : null)), record: [minimum, `${year}-07-01`, minimum, `${year}-01-01`] } };
}

export function aWeatherStation(years: Record<string, WeatherYear>): WeatherStation {
  return { code: "ZZ", name: "Somewhere", municipality: "Nowhere", altitude: 100, setting: "a field", years };
}

import { countDays } from "./countDays";
import type { WeatherQuestion } from "./WeatherQuestion";
import type { WeatherStation } from "./WeatherStation";
import { weatherVariables } from "./weatherVariables";

export interface YearOfDays {
  readonly year: number;
  /** Days that answer the question, in the months asked for. */
  readonly days: number;
  /** Days that answer it in the other months: a tropical night in October is still one. */
  readonly elsewhere: number;
  readonly measured: number;
  readonly expected: number;
  /** Nearly every expected day was measured, so the year can stand beside other years. */
  readonly whole: boolean;
  /** The months asked for in one figure: a mean, a total or a peak, as the variable has it. */
  readonly summary: number | null;
  /** January to December, whatever months were asked for. */
  readonly months: readonly { readonly days: number; readonly measured: number }[];
}

/** A year with more than one day in twenty missing is drawn, marked, and kept out of every mean. */
const WHOLE = 0.95;

const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
const total = (values: readonly number[]) => values.reduce((a, b) => a + b, 0);

/**
 * Several months in one figure. Totals add and peaks take the highest; a mean
 * of months is exact only when each month weighs the days it measured.
 */
function together(figures: readonly { figure: number; weight: number }[], how: "mean" | "sum" | "max"): number | null {
  if (figures.length === 0) return null;
  if (how === "sum") return total(figures.map(({ figure }) => figure));
  if (how === "max") return Math.max(...figures.map(({ figure }) => figure));
  return total(figures.map(({ figure, weight }) => figure * weight)) / total(figures.map(({ weight }) => weight));
}

/** The count behind every chart on the page, recomputed from the histograms each time the question changes. */
export function daysPerYear(station: WeatherStation, question: WeatherQuestion): YearOfDays[] {
  const info = weatherVariables[question.variable];
  return Object.entries(station.years)
    .flatMap(([label, measuredYear]) => {
      const variable = measuredYear[question.variable];
      if (!variable) return [];
      const year = Number(label);
      const months = variable.months.map((histogram) => ({
        days: countDays(histogram, question, info.bin),
        measured: total(histogram?.slice(1) ?? []),
      }));
      const asked = (month: number) => question.months.includes(month);
      const measured = total(months.filter((_, month) => asked(month)).map((month) => month.measured));
      const expected = total(question.months.map((month) => daysIn(year, month)));
      const days = total(months.filter((_, month) => asked(month)).map((month) => month.days));

      const figures = variable.summaries.flatMap((figure, month) => (asked(month) && figure !== null ? [{ figure, weight: months[month]?.measured ?? 0 }] : []));
      const summary = together(figures, info.summary);

      return [{ year, days, elsewhere: total(months.map((month) => month.days)) - days, measured, expected, whole: measured / expected >= WHOLE, summary, months }];
    })
    .sort((a, b) => a.year - b.year);
}

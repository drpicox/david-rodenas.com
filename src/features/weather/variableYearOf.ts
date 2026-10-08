import { histogramOf } from "./histogramOf";
import type { WeatherVariableYear } from "./WeatherStation";
import type { WeatherVariableInfo } from "./weatherVariables";

/** One day's value of one variable, the day as YYYY-MM-DD. */
export interface Day {
  readonly date: string;
  readonly value: number;
}

const round = (value: number, decimals: number) => Math.round(value * 10 ** decimals) / 10 ** decimals;

function summaryOf(values: readonly number[], how: WeatherVariableInfo["summary"]): number | null {
  if (values.length === 0) return null;
  if (how === "max") return Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  return round(how === "sum" ? sum : sum / values.length, 2);
}

/**
 * A year of one variable's days, as it is kept: each month's histogram and
 * its figure, and the most extreme day each way, which no histogram can keep.
 * Whoever measured the days, the year is kept alike, so the page draws it alike.
 */
export function variableYearOf(days: readonly Day[], info: WeatherVariableInfo): WeatherVariableYear {
  const byMonth = Array.from({ length: 12 }, (_, month) => days.filter(({ date }) => Number(date.slice(5, 7)) === month + 1).map(({ value }) => value));
  const highest = days.reduce((a, b) => (b.value > a.value ? b : a));
  const lowest = days.reduce((a, b) => (b.value < a.value ? b : a));
  return {
    months: byMonth.map((values) => histogramOf(values, info.bin, info.range)),
    summaries: byMonth.map((values) => summaryOf(values, info.summary)),
    record: [highest.value, highest.date, lowest.value, lowest.date],
  };
}

/** The four things kept: the day's minimum, its maximum, its rain, and the most rain it had in one hour. */
export type WeatherVariable = "tn" | "tx" | "pp" | "pi";

/**
 * A month of daily values as a histogram: `[start, c0, c1, …]`, where bin i
 * holds the days with a value in [start + i·bin, start + (i+1)·bin). Only the
 * bins between the first and the last day are kept. Null when no day had a value.
 */
export type SparseHistogram = readonly number[] | null;

export interface WeatherVariableYear {
  /** January to December. */
  readonly months: readonly SparseHistogram[];
  /** The month in one figure, exact: the mean of a temperature, the total of the rain, the peak of an intensity. */
  readonly summaries: readonly (number | null)[];
  /** The highest value of the year and its date, then the lowest and its date — what a histogram cannot keep. */
  readonly record: readonly [number, string, number, string];
}

export type WeatherYear = Readonly<Partial<Record<WeatherVariable, WeatherVariableYear>>>;

/**
 * One weather station as it is kept and as it is served. What is kept is
 * derived — histograms and monthly figures — and never the daily series,
 * which stays at its source where it is corrected.
 */
export interface WeatherStation {
  readonly code: string;
  readonly name: string;
  readonly municipality: string;
  /** Metres above the sea. */
  readonly altitude: number;
  /** What is around it, in a few words. */
  readonly setting: string;
  readonly years: Readonly<Record<string, WeatherYear>>;
}

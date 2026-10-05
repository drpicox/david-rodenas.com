/** A column of numbers in a few figures. */
export interface Summary {
  readonly count: number;
  readonly mean: number;
  /** Half the values are below it. */
  readonly median: number;
  /** How far values usually are from the mean: the sample's standard deviation. */
  readonly deviation: number;
  readonly lowest: number;
  readonly highest: number;
}

/** How many, the mean, the middle, the spread and both ends; nothing of nothing. */
export function summaryOf(values: readonly number[]): Summary {
  const count = values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const mean = count > 0 ? values.reduce((a, b) => a + b, 0) / count : Number.NaN;
  const middle = Math.floor(count / 2);
  const median = count === 0 ? Number.NaN : count % 2 === 1 ? (sorted[middle] ?? Number.NaN) : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  const deviation = count > 1 ? Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (count - 1)) : Number.NaN;
  return { count, mean, median, deviation, lowest: sorted[0] ?? Number.NaN, highest: sorted[count - 1] ?? Number.NaN };
}

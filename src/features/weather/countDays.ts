import type { SparseHistogram } from "./WeatherStation";

export interface Threshold {
  readonly threshold: number;
  /** True for "at or above"; false for "below". There is no "at or below": the bins cannot answer it exactly. */
  readonly atLeast: boolean;
}

/** How many of a histogram's days are on the asked side of the threshold. Exact when the threshold is a bin's edge. */
export function countDays(histogram: SparseHistogram, { threshold, atLeast }: Threshold, bin: number): number {
  if (!histogram) return 0;
  const [start = 0, ...counts] = histogram;
  return counts.reduce((days, count, index) => {
    const above = start + index * bin >= threshold - 1e-9;
    return above === atLeast ? days + count : days;
  }, 0);
}

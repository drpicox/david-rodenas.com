import type { SparseHistogram } from "./WeatherStation";

/**
 * Bins are closed on the left: the one starting at k holds [k, k + bin). Two
 * questions then have exact answers — how many days at or above a threshold,
 * how many below it — and those are the only two the page asks.
 */
export function histogramOf(values: readonly number[], bin: number, [low, high]: readonly [number, number]): SparseHistogram {
  if (values.length === 0) return null;
  const bins = Math.round((high - low) / bin);
  const counts = new Map<number, number>();
  for (const value of values) {
    const index = Math.min(bins - 1, Math.max(0, Math.floor((value - low) / bin + 1e-9)));
    counts.set(index, (counts.get(index) ?? 0) + 1);
  }
  const first = Math.min(...counts.keys());
  const last = Math.max(...counts.keys());
  const start = Math.round((low + first * bin) * 1000) / 1000;
  return [start, ...Array.from({ length: last - first + 1 }, (_, offset) => counts.get(first + offset) ?? 0)];
}

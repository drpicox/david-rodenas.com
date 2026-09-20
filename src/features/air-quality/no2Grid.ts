import type { No2Selection } from "./No2Selection";
import type { No2Station } from "./No2Station";
import { tallies } from "./tallies";

export interface No2Cell {
  /** µg/m³, or null where nothing was measured. */
  readonly mean: number | null;
  /** How many hourly measurements the mean is of. */
  readonly count: number;
}

/**
 * The picture itself: the mean at each hour of the day (down) in each month
 * of the year (across), over the years and the days selected. Sums are added
 * and divided once, so every measurement weighs the same.
 */
export function no2Grid(station: No2Station, selection: No2Selection): No2Cell[][] {
  const chosen = Object.entries(station.years)
    .filter(([year]) => Number(year) >= selection.from && Number(year) <= selection.to)
    .flatMap(([, measured]) => tallies(measured, selection.days));

  return Array.from({ length: 24 }, (_, hour) =>
    Array.from({ length: 12 }, (_, month) => {
      const sum = chosen.reduce((all, tally) => all + (tally.sums[month]?.[hour] ?? 0), 0);
      const count = chosen.reduce((all, tally) => all + (tally.counts[month]?.[hour] ?? 0), 0);
      return { mean: count > 0 ? sum / count : null, count };
    }),
  );
}

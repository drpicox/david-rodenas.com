import type { No2Selection } from "./No2Selection";
import type { No2Station } from "./No2Station";
import { tallies } from "./tallies";

export interface No2AnnualMean {
  readonly year: number;
  readonly mean: number;
  /** The share of the year's hours that were measured, 0 to 1, whichever days are asked for. */
  readonly measured: number;
}

const hoursIn = (year: number) => ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365) * 24;
const total = (grid: readonly (readonly number[])[]) => grid.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);

/** One mean a year, oldest first; years with nothing measured on those days are left out. */
export function no2AnnualMeans(station: No2Station, days: No2Selection["days"]): No2AnnualMean[] {
  return Object.entries(station.years)
    .map(([year, measured]) => {
      const chosen = tallies(measured, days);
      const count = chosen.reduce((sum, tally) => sum + total(tally.counts), 0);
      const sum = chosen.reduce((all, tally) => all + total(tally.sums), 0);
      const everything = tallies(measured, "all").reduce((all, tally) => all + total(tally.counts), 0);
      return { year: Number(year), mean: count > 0 ? sum / count : Number.NaN, measured: everything / hoursIn(Number(year)) };
    })
    .filter(({ mean }) => !Number.isNaN(mean))
    .sort((a, b) => a.year - b.year);
}

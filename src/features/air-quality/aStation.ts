import type { HourlySums, No2Station, No2Year } from "./No2Station";

/** Every hour of every month measured `days` times at `value`: a station made for a test. */
export function flatSums(value: number, days: number): HourlySums {
  const months = <T>(cell: T) => Array.from({ length: 12 }, () => new Array<T>(24).fill(cell));
  return { sums: months(value * days), counts: months(days) };
}

export function aStation(years: Record<string, No2Year>): No2Station {
  return { code: "00000000", name: "Somewhere", kind: "traffic", area: "urban", years };
}

import type { No2Selection } from "./No2Selection";
import type { No2Station } from "./No2Station";

/** Everything a station has: every day, from its first year to its last. */
export function wholeRecord(station: No2Station): No2Selection {
  const years = Object.keys(station.years).map(Number);
  return { from: Math.min(...years), to: Math.max(...years), days: "all" };
}

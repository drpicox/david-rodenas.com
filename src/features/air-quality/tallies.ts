import type { No2Selection } from "./No2Selection";
import type { HourlySums, No2Year } from "./No2Station";

/** The halves of a year that a choice of days takes in. */
export function tallies(year: No2Year, days: No2Selection["days"]): HourlySums[] {
  if (days === "workdays") return [year.workdays];
  if (days === "weekends") return [year.weekends];
  return [year.workdays, year.weekends];
}

import type { No2Station, No2Year } from "./No2Station";

/** A station made for a test, with the years it is handed. */
export function aStation(years: Record<string, No2Year>): No2Station {
  return { code: "00000000", name: "Somewhere", kind: "traffic", area: "urban", years };
}

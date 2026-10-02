import type { No2Selection } from "./No2Selection";
import { no2Stations } from "./no2Stations";

export interface AskedNo2 {
  /** The stations asked about, by code: one, or every one. */
  readonly codes: readonly string[];
  readonly days: No2Selection["days"];
  readonly from?: number;
  readonly to?: number;
  /** January is 1. */
  readonly month?: number;
  /** As the network numbers them, 1 to 24. */
  readonly hour?: number;
}

const ALL = "all";
const DAYS = ["all", "workdays", "weekends"] as const;
const listed = (names: readonly string[]) => `${names.slice(0, -1).join(", ")} or ${names.at(-1)}`;
const numberOf = (said: unknown) => (typeof said === "number" ? said : typeof said === "string" && said.trim() !== "" ? Number(said) : Number.NaN);

/** A whole number from what was said, inside a range, or the reason it is not one. */
function whole(name: string, said: unknown, what: string, least = -Infinity, most = Infinity): { value?: number } | { refused: string } {
  if (said === undefined) return {};
  const value = numberOf(said);
  return Number.isInteger(value) && value >= least && value <= most ? { value } : { refused: `${name}: ${String(said)} is not ${what}` };
}

/** What an agent asked of the NO2 measurements, made into the page's own selection and a cell of its table, or refused with the reason. */
export function askedNo2(input: Readonly<Record<string, unknown>>): AskedNo2 | { refused: string } {
  const codes = no2Stations.map(({ code }) => code);
  const station = String(input["station"] ?? codes[0]);
  if (station !== ALL && !codes.includes(station)) return { refused: `station: ${station} is not one of ${listed([...codes, ALL])}` };
  const days = String(input["days"] ?? "all");
  if (!(DAYS as readonly string[]).includes(days)) return { refused: `days: ${days} is not one of ${listed(DAYS)}` };

  const asked = {
    from: whole("from", input["from"], "a year"),
    to: whole("to", input["to"], "a year"),
    month: whole("month", input["month"], "a month from 1 to 12", 1, 12),
    hour: whole("hour", input["hour"], "an hour from 1 to 24", 1, 24),
  };
  const refusal = Object.values(asked).find((said) => "refused" in said);
  if (refusal) return refusal as { refused: string };
  const values = Object.fromEntries(Object.entries(asked).flatMap(([name, said]) => ("value" in said && said.value !== undefined ? [[name, said.value]] : [])));
  return { codes: station === ALL ? codes : [station], days: days as No2Selection["days"], ...values };
}

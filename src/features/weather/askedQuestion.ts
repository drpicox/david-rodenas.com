import { stationsNamed } from "./stationsNamed";
import { weatherGroups, type WeatherGroup } from "./weatherGroups";
import type { WeatherQuestion } from "./WeatherQuestion";
import { weatherPresets } from "./weatherPresets";

export interface Asked {
  /** The stations asked about, by code: one, or every one of a group. */
  readonly codes: readonly string[];
  /** Where they are kept, and who is credited for them. */
  readonly group: WeatherGroup;
  /** The preset the question started from, for the page's own list. */
  readonly kind: string;
  readonly question: WeatherQuestion;
  readonly from?: number;
  readonly to?: number;
}

/** Every name a question can give, group by group: each station, then all of them. */
const NAMES = weatherGroups.flatMap((group) => [...group.stations.map(({ code }) => code), group.every.name]);
const listed = (names: readonly string[]) => `${names.slice(0, -1).join(", ")} or ${names.at(-1)}`;
const numberOf = (said: unknown) => (typeof said === "number" ? said : typeof said === "string" && said.trim() !== "" ? Number(said) : Number.NaN);

/**
 * What an agent asked, made into the page's own question — a kind of day, a
 * threshold that may be moved off it, the months, the stations — or refused
 * with the reason. Months are counted from 1, as people count them; the page
 * counts them from 0.
 */
export function askedQuestion(input: Readonly<Record<string, unknown>>): Asked | { refused: string } {
  const station = String(input["station"] ?? NAMES[0]);
  const named = stationsNamed(station);
  if (!named) return { refused: `station: ${station} is not one of ${listed(NAMES)}` };

  const kind = String(input["kind"] ?? weatherPresets[0]?.id);
  const preset = weatherPresets.find(({ id }) => id === kind);
  if (!preset) return { refused: `kind: ${kind} is not one of ${listed(weatherPresets.map(({ id }) => id))}` };

  const threshold = input["threshold"] === undefined ? preset.threshold : numberOf(input["threshold"]);
  if (!Number.isFinite(threshold)) return { refused: `threshold: ${String(input["threshold"])} is not a number` };

  const months = Array.isArray(input["months"]) ? (input["months"] as unknown[]) : input["months"] === undefined ? Array.from({ length: 12 }, (_, month) => month + 1) : [input["months"]];
  const stranger = months.find((month) => !Number.isInteger(month) || (month as number) < 1 || (month as number) > 12);
  if (stranger !== undefined) return { refused: `months: ${String(stranger)} is not a month from 1 to 12` };

  const from = input["from"] === undefined ? undefined : numberOf(input["from"]);
  if (from !== undefined && !Number.isInteger(from)) return { refused: `from: ${String(input["from"])} is not a year` };
  const to = input["to"] === undefined ? undefined : numberOf(input["to"]);
  if (to !== undefined && !Number.isInteger(to)) return { refused: `to: ${String(input["to"])} is not a year` };

  return {
    codes: named.codes,
    group: named.group,
    kind,
    question: { variable: preset.variable, atLeast: preset.atLeast, threshold, months: [...new Set(months as number[])].sort((a, b) => a - b).map((month) => month - 1) },
    ...(from !== undefined && { from }),
    ...(to !== undefined && { to }),
  };
}

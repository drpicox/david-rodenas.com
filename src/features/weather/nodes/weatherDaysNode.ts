import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Column, Table } from "../../../platform/blueprint/Table";
import { daysPerYear } from "../daysPerYear";
import { weatherPresets } from "../weatherPresets";
import { weatherStations } from "../weatherStations";
import { weatherVariables } from "../weatherVariables";
import { weatherStationChoice } from "./weatherStationChoice";
import { weatherStationsRead } from "./weatherStationsRead";

/** The months asked for, as people count them, from 1; every month when none are. */
function monthsOf(text: string): number[] {
  const asked = text.split(/[\s,]+/).filter(Boolean).map(Number);
  const wrong = asked.find((month) => !Number.isInteger(month) || month < 1 || month > 12);
  if (wrong !== undefined) throw new Error(`months: ${wrong} is not a month: January is 1, December 12`);
  return asked.length > 0 ? asked.map((month) => month - 1) : Array.from({ length: 12 }, (_, month) => month);
}

/**
 * The days of a kind each year at a station — torrid nights, frost, heavy
 * rain — counted from the same histograms the hot nights page draws, with
 * the threshold moved if asked, and in the months asked. A year not measured
 * nearly whole says so, and so does the year still running.
 */
export const weatherDaysNode: NodeKind = {
  name: "weather-days",
  title: "Days of a kind",
  role: "source",
  shelf: "Weather",
  summary: "How many days of a kind each year at a weather station: torrid or tropical nights, hot days, frost, rain — the threshold moved if asked.",
  inputs: [
    { name: "station", label: "station", type: "text", initial: weatherStations[0]?.code ?? "WU", editor: weatherStationChoice },
    { name: "kind", label: "kind", type: "text", initial: weatherPresets[0]?.id ?? "torrid-nights", editor: { kind: "choice", choices: weatherPresets.map((preset) => ({ value: preset.id, label: preset.name })) } },
    { name: "threshold", label: "threshold", type: "number", optional: true, editor: { kind: "number", min: -20, max: 60, step: 0.5 }, hint: "moves the kind's own: °C, mm or mm/h" },
    { name: "months", label: "months", type: "text", optional: true, hint: "the months to count in, January being 1, as: 6 7 8; every month when left empty" },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs, { read }) => {
    const preset = weatherPresets.find((each) => each.id === inputs["kind"]);
    if (!preset) throw new Error(`kind: there is no kind ${String(inputs["kind"])}: there are ${weatherPresets.map((each) => each.id).join(", ")}`);
    const threshold = inputs["threshold"] === undefined ? preset.threshold : Number(inputs["threshold"]);
    const question = { variable: preset.variable, atLeast: preset.atLeast, threshold, months: monthsOf(String(inputs["months"] ?? "")) };
    const asked = String(inputs["station"]);
    const { stations, credit } = weatherStationsRead(read, asked);
    const rows = stations.flatMap((station) =>
      daysPerYear(station, question).map((year) => ({ ...(asked === "all" && { station: station.code }), year: year.year, days: year.days, measured: year.measured, whole: year.whole ? "yes" : "no" })),
    );
    const variable = weatherVariables[preset.variable];
    const columns: Column[] = [
      ...(asked === "all" ? [{ name: "station", kind: "text" as const, key: true }] : []),
      { name: "year", kind: "number", key: true },
      { name: "days", kind: "number", about: `${preset.name}: the ${variable.name} ${preset.atLeast ? "at least" : "below"} ${threshold} ${variable.unit}` },
      { name: "measured", kind: "number", about: "the days measured in the months asked" },
      { name: "whole", kind: "text", about: "yes when nearly every day was measured, and the year is over" },
    ];
    return { outputs: { table: { columns, rows, credits: [credit] } satisfies Table }, said: `${preset.name}: ${variable.name} ${preset.atLeast ? "≥" : "<"} ${threshold} ${variable.unit}` };
  },
};

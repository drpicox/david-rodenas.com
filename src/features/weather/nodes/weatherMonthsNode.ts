import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { SEASON_ORDER } from "../../../platform/data/SEASON_ORDER";
import { seasonOf } from "../../../platform/data/seasonOf";
import type { Column, Row, Table } from "../../../platform/blueprint/Table";
import type { SparseHistogram } from "../WeatherStation";
import { weatherStations } from "../weatherStations";
import { weatherStationChoice } from "./weatherStationChoice";
import { weatherStationsRead } from "./weatherStationsRead";

/** A month with more than one day in twenty missing is marked, as a year is on the page. */
const WHOLE = 0.95;
const daysIn = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
const countOf = (histogram: SparseHistogram | undefined) => (histogram ?? [0]).slice(1).reduce((a, b) => a + b, 0);

/**
 * A weather station month by month, from the figures the site keeps of it:
 * the mean daily minimum and maximum, the rain, the most rain in an hour, and
 * how many days were measured. The year still running is there as far as it
 * goes, its months never whole.
 */
export const weatherMonthsNode: NodeKind = {
  name: "weather-months",
  title: "Weather by month",
  role: "source",
  shelf: "Weather",
  summary: "A weather station of the Meteocat, or one of its long series, month by month: the mean daily minimum and maximum, the rain, and the most rain in an hour.",
  inputs: [{ name: "station", label: "station", type: "text", initial: weatherStations[0]?.code ?? "WU", editor: weatherStationChoice }],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs, { read }) => {
    const asked = String(inputs["station"]);
    const { stations, every, credit } = weatherStationsRead(read, asked);
    const rows = stations.flatMap((station) =>
      Object.entries(station.years).flatMap(([label, year]) =>
        Array.from({ length: 12 }, (_, month): Row | null => {
          const [tn, tx, pp, pi] = [year.tn?.summaries[month] ?? null, year.tx?.summaries[month] ?? null, year.pp?.summaries[month] ?? null, year.pi?.summaries[month] ?? null];
          if (tn === null && tx === null && pp === null) return null;
          const days = Math.max(countOf(year.tn?.months[month]), countOf(year.tx?.months[month]));
          const running = station.soFar?.year === Number(label);
          return { ...(every && { station: station.code }), year: Number(label), month: month + 1, season: seasonOf(month + 1), tn, tx, rain: pp, downpour: pi, days, whole: !running && days >= WHOLE * daysIn(Number(label), month) ? "yes" : "no" };
        }).filter((row): row is Row => row !== null),
      ),
    );
    const columns: Column[] = [
      ...(every ? [{ name: "station", kind: "text" as const, key: true }] : []),
      { name: "year", kind: "number", key: true },
      { name: "month", kind: "number", key: true },
      { name: "season", kind: "text", key: true, about: "winter is December to February, as meteorologists count it", order: SEASON_ORDER },
      { name: "tn", kind: "number", unit: "°C", about: "the mean daily minimum" },
      { name: "tx", kind: "number", unit: "°C", about: "the mean daily maximum" },
      { name: "rain", kind: "number", unit: "mm", about: "the month's rain" },
      { name: "downpour", kind: "number", unit: "mm/h", about: "the most rain in one hour, which the long series do not have" },
      { name: "days", kind: "number", about: "the days measured" },
      { name: "whole", kind: "text", about: "yes when nearly every day was measured, and the month is over" },
    ];
    return { outputs: { table: { columns, rows, credits: [credit] } satisfies Table } };
  },
};

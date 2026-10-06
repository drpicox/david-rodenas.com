import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Column, Row, Table } from "../../../platform/blueprint/Table";
import { seasonOf } from "../../../platform/data/seasonOf";
import { no2Grid } from "../no2Grid";
import type { No2Selection } from "../No2Selection";
import { no2Stations } from "../no2Stations";
import { no2DaysChoice } from "./no2DaysChoice";
import { no2StationChoice } from "./no2StationChoice";
import { no2StationsRead } from "./no2StationsRead";

/**
 * A measuring point's day, hour by hour and month by month, over the years
 * asked for — all of them together, as the NO2 page draws them, or each year
 * apart, to set an hour of a month beside that month's weather. Hours are
 * numbered 1 to 24 as the network numbers them, and the network does not say
 * by which clock.
 */
export const no2HoursNode: NodeKind = {
  name: "no2-hours",
  title: "NO2 by hour",
  role: "source",
  shelf: "Air",
  summary: "A measuring point's mean NO2 at each hour of the day, in each month, over the years asked for — together, or each year apart: the shape of a working day.",
  inputs: [
    { name: "station", label: "measuring point", type: "text", initial: no2Stations[0]?.code ?? "08019004", editor: no2StationChoice },
    { name: "from", label: "from", type: "number", optional: true, editor: { kind: "number", min: 1991, max: 2100, step: 1 } },
    { name: "to", label: "to", type: "number", optional: true, editor: { kind: "number", min: 1991, max: 2100, step: 1 } },
    { name: "days", label: "days", type: "text", initial: "all", editor: no2DaysChoice },
    { name: "years", label: "the years", type: "text", initial: "together", editor: { kind: "choice", choices: [{ value: "together", label: "all together" }, { value: "each", label: "each apart" }] } },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs, { read }) => {
    const code = String(inputs["station"]);
    if (code === "all") throw new Error("measuring point: the hours are of one measuring point at a time");
    const { stations, credit } = no2StationsRead(read, code);
    const station = stations[0];
    if (!station) throw new Error(`station: there is no measuring point ${code}`);
    const held = Object.keys(station.years).map(Number);
    const from = inputs["from"] === undefined ? Math.min(...held) : Number(inputs["from"]);
    const to = inputs["to"] === undefined ? Math.max(...held) : Number(inputs["to"]);
    const days = String(inputs["days"]) as No2Selection["days"];
    const each = inputs["years"] === "each";
    // A year apart is a grid of its own; all together, one grid of every year asked for.
    const spans = each ? held.filter((year) => year >= from && year <= to).sort((a, b) => a - b).map((year) => [year, year] as const) : [[from, to] as const];
    const rows = spans.flatMap(([first, last]) =>
      no2Grid(station, { from: first, to: last, days })
        .flatMap((row, hour) => row.map((cell, month) => ({ cell, month, hour })))
        .filter(({ cell }) => cell.mean !== null)
        .sort((a, b) => a.month - b.month || a.hour - b.hour)
        .map(({ cell, month, hour }): Row => ({ ...(each && { year: first }), month: month + 1, season: seasonOf(month + 1), hour: hour + 1, no2: cell.mean, hours: cell.count })),
    );
    const columns: Column[] = [
      ...(each ? [{ name: "year", kind: "number" as const, key: true }] : []),
      { name: "month", kind: "number", key: true },
      { name: "season", kind: "text", key: true, about: "winter is December to February, as meteorologists count it" },
      { name: "hour", kind: "number", key: true, about: "the network's hour, 1 to 24; it does not say by which clock" },
      { name: "no2", kind: "number", unit: "µg/m³", about: each ? "the mean of that hour, that month, that year" : `the mean, ${from} to ${to}` },
      { name: "hours", kind: "number", about: "the hours the mean is of" },
    ];
    const table: Table = { columns, rows, credits: [credit] };
    return { outputs: { table }, said: `${station.name}, ${from}–${to}`, settled: { from, to } };
  },
};

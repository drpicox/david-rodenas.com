import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Table } from "../../../platform/blueprint/Table";
import { no2Grid } from "../no2Grid";
import type { No2Selection } from "../No2Selection";
import { no2Stations } from "../no2Stations";
import { no2DaysChoice } from "./no2DaysChoice";
import { no2StationChoice } from "./no2StationChoice";
import { no2StationsRead } from "./no2StationsRead";

/**
 * A measuring point's day, hour by hour and month by month, over the years
 * asked for: the table the NO2 page draws, as rows. Hours are numbered 1 to
 * 24 as the network numbers them, and the network does not say by which clock.
 */
export const no2HoursNode: NodeKind = {
  name: "no2-hours",
  title: "NO2 by hour",
  role: "source",
  shelf: "Air",
  summary: "A measuring point's mean NO2 at each hour of the day, in each month, over the years asked for: the shape of a working day.",
  inputs: [
    { name: "station", label: "measuring point", type: "text", initial: no2Stations[0]?.code ?? "08019004", editor: no2StationChoice },
    { name: "from", label: "from", type: "number", optional: true, editor: { kind: "number", min: 1991, max: 2100, step: 1 } },
    { name: "to", label: "to", type: "number", optional: true, editor: { kind: "number", min: 1991, max: 2100, step: 1 } },
    { name: "days", label: "days", type: "text", initial: "all", editor: no2DaysChoice },
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
    const grid = no2Grid(station, { from, to, days: String(inputs["days"]) as No2Selection["days"] });
    const rows = grid.flatMap((row, hour) => row.flatMap((cell, month) => (cell.mean === null ? [] : [{ month: month + 1, hour: hour + 1, no2: cell.mean, hours: cell.count }])));
    const table: Table = {
      columns: [
        { name: "month", kind: "number", key: true },
        { name: "hour", kind: "number", key: true, about: "the network's hour, 1 to 24; it does not say by which clock" },
        { name: "no2", kind: "number", unit: "µg/m³", about: `the mean, ${from} to ${to}` },
        { name: "hours", kind: "number", about: "the hours the mean is of" },
      ],
      rows,
      credits: [credit],
    };
    return { outputs: { table }, said: `${station.name}, ${from}–${to}`, settled: { from, to } };
  },
};

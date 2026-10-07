import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { SEASON_ORDER } from "../../../platform/data/SEASON_ORDER";
import { seasonOf } from "../../../platform/data/seasonOf";
import type { Column, Row, Table } from "../../../platform/blueprint/Table";
import type { No2Selection } from "../No2Selection";
import { no2Stations } from "../no2Stations";
import { tallies } from "../tallies";
import { no2DaysChoice } from "./no2DaysChoice";
import { no2StationChoice } from "./no2StationChoice";
import { no2StationsRead } from "./no2StationsRead";

const hoursIn = (year: number, month: number) => new Date(Date.UTC(year, month + 1, 0)).getUTCDate() * 24;
const total = (values: readonly number[] | undefined) => (values ?? []).reduce((a, b) => a + b, 0);

/**
 * A measuring point month by month: the mean NO2 of the month's hours, on the
 * days of the week asked for, every hour weighing what it measured, and the
 * share of the month's hours that were measured at all.
 */
export const no2MonthsNode: NodeKind = {
  name: "no2-months",
  title: "NO2 by month",
  role: "source",
  shelf: "Air",
  summary: "A measuring point of the Generalitat month by month: the mean NO2 of the month's hours, and how much of the month was measured.",
  inputs: [
    { name: "station", label: "measuring point", type: "text", initial: no2Stations[0]?.code ?? "08019004", editor: no2StationChoice },
    { name: "days", label: "days", type: "text", initial: "all", editor: no2DaysChoice },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs, { read }) => {
    const asked = String(inputs["station"]);
    const days = String(inputs["days"]) as No2Selection["days"];
    const { stations, credit } = no2StationsRead(read, asked);
    const rows = stations.flatMap((station) =>
      Object.entries(station.years).flatMap(([label, year]) =>
        Array.from({ length: 12 }, (_, month): Row | null => {
          const chosen = tallies(year, days);
          const count = chosen.reduce((sum, tally) => sum + total(tally.counts[month]), 0);
          if (count === 0) return null;
          const sum = chosen.reduce((all, tally) => all + total(tally.sums[month]), 0);
          const everything = tallies(year, "all").reduce((all, tally) => all + total(tally.counts[month]), 0);
          return { ...(asked === "all" && { station: station.code }), year: Number(label), month: month + 1, season: seasonOf(month + 1), no2: sum / count, hours: count, measured: everything / hoursIn(Number(label), month) };
        }).filter((row): row is Row => row !== null),
      ),
    );
    const columns: Column[] = [
      ...(asked === "all" ? [{ name: "station", kind: "text" as const, key: true }] : []),
      { name: "year", kind: "number", key: true },
      { name: "month", kind: "number", key: true },
      { name: "season", kind: "text", key: true, about: "winter is December to February, as meteorologists count it", order: SEASON_ORDER },
      { name: "no2", kind: "number", unit: "µg/m³", about: "the mean of the month's hours" },
      { name: "hours", kind: "number", about: "the hours the mean is of" },
      { name: "measured", kind: "number", about: "the share of the month's hours measured, 0 to 1" },
    ];
    return { outputs: { table: { columns, rows, credits: [credit] } satisfies Table } };
  },
};

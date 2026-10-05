import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Column, Table } from "../../../platform/blueprint/Table";
import { no2AnnualMeans } from "../no2AnnualMeans";
import type { No2Selection } from "../No2Selection";
import { no2Stations } from "../no2Stations";
import { no2DaysChoice } from "./no2DaysChoice";
import { no2StationChoice } from "./no2StationChoice";
import { no2StationsRead } from "./no2StationsRead";

/** A measuring point year by year: the mean of every hour measured, the share of the year that was, and whether the year is over. */
export const no2YearsNode: NodeKind = {
  name: "no2-years",
  title: "NO2 by year",
  role: "source",
  shelf: "Air",
  summary: "A measuring point year by year: the mean NO2 of every hour measured, and the share of the year that was.",
  inputs: [
    { name: "station", label: "measuring point", type: "text", initial: no2Stations[0]?.code ?? "08019004", editor: no2StationChoice },
    { name: "days", label: "days", type: "text", initial: "all", editor: no2DaysChoice },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs, { read }) => {
    const asked = String(inputs["station"]);
    const { stations, credit } = no2StationsRead(read, asked);
    const rows = stations.flatMap((station) =>
      no2AnnualMeans(station, String(inputs["days"]) as No2Selection["days"]).map(({ year, mean, measured }) => ({
        ...(asked === "all" && { station: station.code }),
        year,
        no2: mean,
        measured,
        whole: station.soFar?.year === year ? "no" : "yes",
      })),
    );
    const columns: Column[] = [
      ...(asked === "all" ? [{ name: "station", kind: "text" as const, key: true }] : []),
      { name: "year", kind: "number", key: true },
      { name: "no2", kind: "number", unit: "µg/m³", about: "the mean of every hour measured" },
      { name: "measured", kind: "number", about: "the share of the year's hours measured, 0 to 1" },
      { name: "whole", kind: "text", about: "no for the year still running" },
    ];
    return { outputs: { table: { columns, rows, credits: [credit] } satisfies Table } };
  },
};

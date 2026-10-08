import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Column, Row, Table } from "../../../platform/blueprint/Table";
import { SEASON_ORDER } from "../../../platform/data/SEASON_ORDER";
import { seasonOf } from "../../../platform/data/seasonOf";
import { barcelonaRead } from "./barcelonaRead";

/** Barcelona's mean temperature month by month since 1780, each month in its season: to keep one season of every year, or to set beside another source's months. */
export const barcelonaMonthsNode: NodeKind = {
  name: "barcelona-months",
  title: "Barcelona since 1780, by month",
  role: "source",
  shelf: "Barcelona",
  summary: "Barcelona's mean temperature month by month since 1780, from the Meteocat's long series, each month in its season.",
  inputs: [],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (_inputs, { read }) => {
    const { series, credit } = barcelonaRead(read);
    const rows = Object.entries(series.years).flatMap(([label, months]) =>
      months.flatMap((mean, index): Row[] => (mean === null ? [] : [{ year: Number(label), month: index + 1, season: seasonOf(index + 1), mean }])),
    );
    const columns: Column[] = [
      { name: "year", kind: "number", key: true },
      { name: "month", kind: "number", key: true },
      { name: "season", kind: "text", key: true, about: "winter is December to February, as meteorologists count it", order: SEASON_ORDER },
      { name: "mean", kind: "number", unit: "°C", about: "the month's mean temperature" },
    ];
    return { outputs: { table: { columns, rows, credits: [credit] } satisfies Table } };
  },
};

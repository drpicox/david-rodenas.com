import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Column, Row, Table } from "../../../platform/blueprint/Table";
import { SEASON_ORDER } from "../../../platform/data/SEASON_ORDER";
import { seasonOf } from "../../../platform/data/seasonOf";
import { barcelonaRead } from "./barcelonaRead";

/** Barcelona month by month, its mean temperature since 1780 and its rain since 1786, each month in its season: to keep one season of every year, or to set beside another source's months. */
export const barcelonaMonthsNode: NodeKind = {
  name: "barcelona-months",
  title: "Barcelona since 1780, by month",
  role: "source",
  shelf: "Barcelona",
  summary: "Barcelona month by month, from the Meteocat's long series: the mean temperature since 1780 and the rain since 1786, each month in its season.",
  inputs: [],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (_inputs, { read }) => {
    const temperature = barcelonaRead(read, "temperature");
    const rain = barcelonaRead(read, "rain");
    const years = [...new Set([...Object.keys(temperature.series.years), ...Object.keys(rain.series.years)])].map(Number).sort((a, b) => a - b);
    const rows = years.flatMap((year) =>
      Array.from({ length: 12 }, (_, index): Row[] => {
        const mean = temperature.series.years[year]?.[index] ?? null;
        const fell = rain.series.years[year]?.[index] ?? null;
        return mean === null && fell === null ? [] : [{ year, month: index + 1, season: seasonOf(index + 1), mean, rain: fell }];
      }).flat(),
    );
    const columns: Column[] = [
      { name: "year", kind: "number", key: true },
      { name: "month", kind: "number", key: true },
      { name: "season", kind: "text", key: true, about: "winter is December to February, as meteorologists count it", order: SEASON_ORDER },
      { name: "mean", kind: "number", unit: "°C", about: "the month's mean temperature, since 1780" },
      { name: "rain", kind: "number", unit: "mm", about: "the month's rain, since 1786" },
    ];
    return { outputs: { table: { columns, rows, credits: [temperature.credit, rain.credit] } satisfies Table } };
  },
};

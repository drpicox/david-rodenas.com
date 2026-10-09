import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Column, Table } from "../../../platform/blueprint/Table";
import { barcelonaRead } from "./barcelonaRead";

const round = (value: number) => Math.round(value * 10) / 10;

/** Barcelona's rain year by year since 1786: the total of each year's twelve months, and none for a year that misses one, which would read as a dry year. */
export const barcelonaRainNode: NodeKind = {
  name: "barcelona-rain",
  title: "Barcelona's rain since 1786",
  role: "source",
  shelf: "Barcelona",
  summary: "Barcelona's rain year by year since 1786, from the Meteocat's long series: the total of each year's twelve months.",
  inputs: [],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (_inputs, { read }) => {
    const { series, credit } = barcelonaRead(read, "rain");
    const rows = Object.entries(series.years).map(([label, months]) => {
      const measured = months.filter((month): month is number => month !== null);
      const whole = measured.length === 12;
      return { year: Number(label), rain: whole ? round(measured.reduce((a, b) => a + b, 0)) : null, whole: whole ? "yes" : "no" };
    });
    const columns: Column[] = [
      { name: "year", kind: "number", key: true },
      { name: "rain", kind: "number", unit: "mm", about: "the rain of the year's twelve months; none for a year that misses a month" },
      { name: "whole", kind: "text", about: "yes when every month of the year has its rain" },
    ];
    return { outputs: { table: { columns, rows, credits: [credit] } satisfies Table } };
  },
};

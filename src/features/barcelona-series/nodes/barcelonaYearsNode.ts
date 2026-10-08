import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Column, Table } from "../../../platform/blueprint/Table";
import { barcelonaRead } from "./barcelonaRead";

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Barcelona's mean temperature year by year since 1780: the mean of each
 * year's twelve monthly means. A year missing a month has none, because
 * eleven months without a winter's would read as a warm year.
 */
export const barcelonaYearsNode: NodeKind = {
  name: "barcelona-years",
  title: "Barcelona since 1780",
  role: "source",
  shelf: "Barcelona",
  summary: "Barcelona's mean temperature year by year since 1780, from the Meteocat's long series: the mean of each year's twelve months.",
  inputs: [],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (_inputs, { read }) => {
    const { series, credit } = barcelonaRead(read);
    const rows = Object.entries(series.years).map(([label, months]) => {
      const measured = months.filter((month): month is number => month !== null);
      const whole = measured.length === 12;
      return { year: Number(label), mean: whole ? round(measured.reduce((a, b) => a + b, 0) / 12) : null, whole: whole ? "yes" : "no" };
    });
    const columns: Column[] = [
      { name: "year", kind: "number", key: true },
      { name: "mean", kind: "number", unit: "°C", about: "the mean of the year's twelve monthly means; none for a year that misses a month" },
      { name: "whole", kind: "text", about: "yes when every month of the year has its mean" },
    ];
    return { outputs: { table: { columns, rows, credits: [credit] } satisfies Table } };
  },
};

import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { numberSaid } from "../../../platform/blueprint/numberSaid";
import { summaryOf } from "../../../platform/blueprint/summaryOf";
import type { Column, Row, Table } from "../../../platform/blueprint/Table";
import { seaPointChoice } from "./seaPointChoice";
import { seaPointsRead } from "./seaPointsRead";

/** A year with more than one day in twenty missing is marked, as the weather's are. */
const WHOLE = 0.95;
const round = (value: number) => Math.round(value * 100) / 100;
const daysIn = (year: number) => (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;

/**
 * The sea off a stretch of the coast, year by year: the mean of its days, its
 * warmest day, and how many days it was at least as warm as asked — a summer
 * sea, counted, as the weather counts its hot nights.
 */
export const seaYearsNode: NodeKind = {
  name: "sea-years",
  title: "Sea by year",
  role: "source",
  shelf: "Sea",
  summary: "The temperature of the sea off a stretch of the Catalan coast, year by year: the mean of its days, its warmest day, and the days at least as warm as asked.",
  inputs: [
    { name: "point", label: "off", type: "text", initial: "barcelona", editor: seaPointChoice },
    { name: "warm", label: "warm from", type: "number", initial: 26, editor: { kind: "number", min: 10, max: 30, step: 0.5, show: (value) => `${numberSaid(value)} °C` } },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs, { read }) => {
    const asked = String(inputs["point"]);
    const warm = Number(inputs["warm"]);
    const { points, credit } = seaPointsRead(read, asked);
    const rows = points.flatMap((point) =>
      Object.entries(point.years).flatMap(([label, days]): Row[] => {
        const year = Number(label);
        const measured = days.filter((value): value is number => value !== null);
        if (measured.length === 0) return [];
        const { mean, highest } = summaryOf(measured);
        const whole = point.soFar?.year !== year && measured.length >= WHOLE * daysIn(year);
        return [{ ...(asked === "all" && { point: point.code }), year, sst: round(mean), warmest: highest, warm: measured.filter((value) => value >= warm).length, days: measured.length, whole: whole ? "yes" : "no" }];
      }),
    );
    const columns: Column[] = [
      ...(asked === "all" ? [{ name: "point", kind: "text" as const, key: true }] : []),
      { name: "year", kind: "number", key: true },
      { name: "sst", kind: "number", unit: "°C", about: "the mean temperature of the sea's surface over the year's days" },
      { name: "warmest", kind: "number", unit: "°C", about: "the year's warmest day" },
      { name: "warm", kind: "number", unit: "days", about: `the days the sea was at ${numberSaid(warm)} °C or more` },
      { name: "days", kind: "number", about: "the days measured" },
      { name: "whole", kind: "text", about: "yes when nearly every day was measured, and the year is over" },
    ];
    return { outputs: { table: { columns, rows, credits: [credit] } satisfies Table } };
  },
};

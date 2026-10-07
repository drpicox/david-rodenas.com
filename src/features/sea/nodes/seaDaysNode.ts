import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Column, Row, Table } from "../../../platform/blueprint/Table";
import { seaPointChoice } from "./seaPointChoice";
import { seaPointsRead } from "./seaPointsRead";

const DAY = 86_400_000;
const round = (value: number) => Math.round(value * 100) / 100;
/** A day of a year as the calendar says it, so that the same day of different years is found though a leap year shifts the count. */
const dateOf = (year: number, day: number) => new Date(Date.UTC(year, 0, 1) + day * DAY).toISOString().slice(0, 10);

/**
 * One year of the sea, day by day, beside what is normal for each day: the
 * mean of the same day of the calendar over the years asked for — thirty, as
 * climatologists take them — and how far above it the day was. Left without
 * a year, it is the latest the site has, the one still running.
 */
export const seaDaysNode: NodeKind = {
  name: "sea-days",
  title: "Sea day by day",
  role: "source",
  shelf: "Sea",
  summary: "A year of the sea off a stretch of the coast, day by day, beside the normal for each day — the mean of the same day over the years asked — and how far above it.",
  inputs: [
    { name: "point", label: "off", type: "text", initial: "barcelona", editor: { kind: "choice", choices: seaPointChoice.kind === "choice" ? seaPointChoice.choices.filter((choice) => choice.value !== "all") : [] } },
    { name: "year", label: "the year", type: "number", optional: true, editor: { kind: "number", min: 1982, max: 2100, step: 1 }, hint: "the latest the site has when left empty" },
    { name: "from", label: "normal from", type: "number", initial: 1991, editor: { kind: "number", min: 1982, max: 2100, step: 1 } },
    { name: "to", label: "normal to", type: "number", initial: 2020, editor: { kind: "number", min: 1982, max: 2100, step: 1 } },
  ],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs, { read }) => {
    const {
      points: [point],
      credit,
    } = seaPointsRead(read, String(inputs["point"]));
    if (!point) throw new Error("off: there is no point to read");
    const held = Object.keys(point.years).map(Number);
    const year = inputs["year"] === undefined || inputs["year"] === "" ? Math.max(...held) : Number(inputs["year"]);
    const days = point.years[String(year)];
    if (!days) throw new Error(`the year: the site holds ${held[0]} to ${held.at(-1)}, not ${year}`);
    const [from, to] = [Number(inputs["from"]), Number(inputs["to"])];
    const normal = new Map<string, number[]>();
    for (const [label, values] of Object.entries(point.years)) {
      if (Number(label) < from || Number(label) > to) continue;
      values.forEach((value, day) => {
        if (value !== null) normal.set(dateOf(Number(label), day).slice(5), [...(normal.get(dateOf(Number(label), day).slice(5)) ?? []), value]);
      });
    }
    const rows = days.map((sst, day): Row => {
      const date = dateOf(year, day);
      const usual = normal.get(date.slice(5));
      const mean = usual ? round(usual.reduce((a, b) => a + b, 0) / usual.length) : null;
      return { day: day + 1, date, sst, normal: mean, above: sst === null || mean === null ? null : round(sst - mean) };
    });
    const columns: Column[] = [
      { name: "day", kind: "number", key: true, about: `the day of ${year}, from the first of January` },
      { name: "date", kind: "text" },
      { name: "sst", kind: "number", unit: "°C", about: `the temperature of the sea's surface, ${year}` },
      { name: "normal", kind: "number", unit: "°C", about: `the mean of the same day, ${from} to ${to}` },
      { name: "above", kind: "number", unit: "°C", about: "how far the day was above its normal; below it, less than nothing" },
    ];
    return { outputs: { table: { columns, rows, credits: [credit] } satisfies Table }, settled: { year } };
  },
};

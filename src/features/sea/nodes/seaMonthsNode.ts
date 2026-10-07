import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { summaryOf } from "../../../platform/blueprint/summaryOf";
import type { Column, Row, Table } from "../../../platform/blueprint/Table";
import { SEASON_ORDER } from "../../../platform/data/SEASON_ORDER";
import { seasonOf } from "../../../platform/data/seasonOf";
import { seaPointChoice } from "./seaPointChoice";
import { seaPointsRead } from "./seaPointsRead";

/** A month with more than one day in twenty missing is marked, as the weather's are. */
const WHOLE = 0.95;
const round = (value: number) => Math.round(value * 100) / 100;

/**
 * The sea off a stretch of the coast, month by month, from the days the site
 * keeps of it: their mean, the warmest and the coolest, and how many were
 * measured. The year still running is there as far as it goes, its months
 * never whole.
 */
export const seaMonthsNode: NodeKind = {
  name: "sea-months",
  title: "Sea by month",
  role: "source",
  shelf: "Sea",
  summary: "The temperature of the sea's surface off a stretch of the Catalan coast, month by month: the mean of its days, the warmest and the coolest.",
  inputs: [{ name: "point", label: "off", type: "text", initial: "barcelona", editor: seaPointChoice }],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: (inputs, { read }) => {
    const asked = String(inputs["point"]);
    const { points, credit } = seaPointsRead(read, asked);
    const rows = points.flatMap((point) =>
      Object.entries(point.years).flatMap(([label, days]) => {
        const year = Number(label);
        const running = point.soFar?.year === year;
        return Array.from({ length: 12 }, (_, month): Row | null => {
          const length = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
          const first = (Date.UTC(year, month, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
          const measured = days.slice(first, first + length).filter((value): value is number => value !== null);
          if (measured.length === 0) return null;
          const { mean, highest, lowest } = summaryOf(measured);
          return { ...(asked === "all" && { point: point.code }), year, month: month + 1, season: seasonOf(month + 1), sst: round(mean), warmest: highest, coolest: lowest, days: measured.length, whole: !running && measured.length >= WHOLE * length ? "yes" : "no" };
        }).filter((row): row is Row => row !== null);
      }),
    );
    const columns: Column[] = [
      ...(asked === "all" ? [{ name: "point", kind: "text" as const, key: true }] : []),
      { name: "year", kind: "number", key: true },
      { name: "month", kind: "number", key: true },
      { name: "season", kind: "text", key: true, about: "winter is December to February, as meteorologists count it", order: SEASON_ORDER },
      { name: "sst", kind: "number", unit: "°C", about: "the mean temperature of the sea's surface over the month's days" },
      { name: "warmest", kind: "number", unit: "°C", about: "the month's warmest day" },
      { name: "coolest", kind: "number", unit: "°C", about: "the month's coolest day" },
      { name: "days", kind: "number", about: "the days measured" },
      { name: "whole", kind: "text", about: "yes when nearly every day was measured, and the month is over" },
    ];
    return { outputs: { table: { columns, rows, credits: [credit] } satisfies Table } };
  },
};

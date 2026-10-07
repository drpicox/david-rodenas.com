import { describe, expect, it } from "vitest";
import { coreTypes } from "../../../platform/blueprint/coreTypes";
import { kitOf } from "../../../platform/blueprint/kitOf";
import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { Pending } from "../../../platform/blueprint/Pending";
import type { Table } from "../../../platform/blueprint/Table";
import type { RunningYear } from "../../../platform/data/RunningYear";
import type { SeaFile } from "../SeaPoint";
import { seaPoints } from "../seaPoints";
import { seaDaysNode } from "./seaDaysNode";
import { seaMonthsNode } from "./seaMonthsNode";
import { seaNodes } from "./seaNodes";
import { seaPointChoice } from "./seaPointChoice";
import { seaPointsNode } from "./seaPointsNode";
import { seaPointsRead } from "./seaPointsRead";
import { seaYearsNode } from "./seaYearsNode";

const daysIn = (year: number) => (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86_400_000;
/** Every day as warm as its month, plus a hundredth of its day of the month, plus a degree a year after 2024. */
const valueOf = (year: number, day: number) => {
  const date = new Date(Date.UTC(year, 0, day + 1));
  return Math.round((date.getUTCMonth() + 1 + date.getUTCDate() / 100 + (year - 2024)) * 100) / 100;
};
const yearOf = (year: number, missing: readonly number[] = []) => Array.from({ length: daysIn(year) }, (_, day) => (missing.includes(day) ? null : valueOf(year, day)));
const fileOf = (code: string, years: SeaFile["years"]): SeaFile => ({ ...(seaPoints.find((point) => point.code === code) ?? seaPoints[0]!), years });
const held = (code: string) => fileOf(code, { 2024: yearOf(2024), 2025: yearOf(2025, [10, 11]) });
const running: RunningYear<SeaFile> = { year: 2026, through: "2026-02-03", refreshed: "2026-10-02", files: Object.fromEntries(seaPoints.map((point) => [`${point.code}.json`, fileOf(point.code, { 2026: yearOf(2026).slice(0, 34) })])) };
const files: Record<string, string> = {
  "/data/sea/index.json": JSON.stringify({ attribution: "NOAA OISST v2.1.", dataset: "https://example.org", years: [2024, 2025], refreshed: "2026-09-21" }),
  "/data/sea/running.json": JSON.stringify(running),
  ...Object.fromEntries(seaPoints.map((point) => [`/data/sea/${point.code}.json`, JSON.stringify(held(point.code))])),
};
const read = (path: string) => {
  const text = files[path];
  if (text === undefined) throw new Error(`no ${path}`);
  return text;
};
const tableOf = (kind: NodeKind, inputs: Record<string, unknown>) => kind.run(inputs, { read }).outputs?.["table"] as Table;

describe("the points a node of the sea reads", () => {
  it("are one, or every one, credited to NOAA with the day the copy was last brought up to date", () => {
    expect(seaPointsRead(read, "all").points).toHaveLength(4);
    expect(seaPointsRead(read, "ebre").credit).toEqual({ said: "NOAA OISST v2.1.", refreshed: "2026-10-02" });
    expect(() => seaPointsRead(read, "mallorca")).toThrow("off: there is no point mallorca");
  });

  it("are offered by name, north to south, and all of them together last", () => {
    expect(seaPointChoice.kind === "choice" && seaPointChoice.choices.map((choice) => choice.label)).toEqual(["Off L'Estartit", "Off Barcelona", "Off Tarragona", "Off the Ebre delta", "every point"]);
  });
});

describe("the sea, month by month", () => {
  it("is the mean of each month's days, its warmest and its coolest, how many were measured, and whether it was whole", () => {
    const table = tableOf(seaMonthsNode, { point: "barcelona" });
    expect(table.rows[0]).toEqual({ year: 2024, month: 1, season: "winter", sst: 1.16, warmest: 1.31, coolest: 1.01, days: 31, whole: "yes" });
    expect(table.rows.find((row) => row["year"] === 2025 && row["month"] === 1)).toMatchObject({ days: 29, whole: "no" });
    expect(table.columns.find((column) => column.name === "sst")).toMatchObject({ unit: "°C" });
    expect(table.credits).toEqual([{ said: "NOAA OISST v2.1.", refreshed: "2026-10-02" }]);
  });

  it("goes on into the year still running, its months never whole", () => {
    const rows = tableOf(seaMonthsNode, { point: "barcelona" }).rows.filter((row) => row["year"] === 2026);
    expect(rows.map((row) => [row["month"], row["days"], row["whole"]])).toEqual([
      [1, 31, "no"],
      [2, 3, "no"],
    ]);
  });

  it("is every point side by side, when asked for all", () => {
    const table = tableOf(seaMonthsNode, { point: "all" });
    expect(new Set(table.rows.map((row) => row["point"]))).toEqual(new Set(seaPoints.map((point) => point.code)));
    expect(table.columns[0]).toMatchObject({ name: "point", key: true });
  });

  it("waits for the year still running while it is on its way", () => {
    const pending = (path: string) => {
      if (path.endsWith("running.json")) throw new Pending(path);
      return read(path);
    };
    expect(() => seaMonthsNode.run({ point: "barcelona" }, { read: pending })).toThrow(Pending);
  });
});

describe("the sea, year by year", () => {
  it("is each year's mean, its warmest day, and its days at least as warm as asked", () => {
    const table = tableOf(seaYearsNode, { point: "barcelona", warm: 12.2 });
    expect(table.rows.map((row) => [row["year"], row["warmest"], row["warm"], row["whole"]])).toEqual([
      [2024, 12.31, 12, "yes"],
      [2025, 13.31, 42, "yes"],
      [2026, 4.03, 0, "no"],
    ]);
    expect(table.columns.find((column) => column.name === "warm")?.about).toContain("12.2 °C");
  });
});

describe("the sea, day by day", () => {
  it("is a year's days beside what is normal for each, the mean of the same day over the years asked, and how far above it", () => {
    const table = tableOf(seaDaysNode, { point: "barcelona", year: 2025, from: 2024, to: 2024 });
    expect(table.rows).toHaveLength(365);
    expect(table.rows[0]).toEqual({ day: 1, date: "2025-01-01", sst: 2.01, normal: 1.01, above: 1 });
    expect(table.rows[10]).toMatchObject({ sst: null, above: null });
  });

  it("is the year still running when no year is asked", () => {
    expect(tableOf(seaDaysNode, { point: "barcelona", from: 2024, to: 2025 }).rows).toHaveLength(34);
  });
});

describe("the sea's points", () => {
  it("are four, north to south, each found by name", () => {
    expect(tableOf(seaPointsNode, {}).rows.map((row) => row["point"])).toEqual(["estartit", "barcelona", "tarragona", "ebre"]);
    expect([...kitOf(seaNodes, coreTypes).kinds.keys()]).toEqual(["sea-months", "sea-years", "sea-days", "sea-points"]);
  });
});

import { describe, expect, it } from "vitest";
import { coreTypes } from "../../../platform/blueprint/coreTypes";
import { kitOf } from "../../../platform/blueprint/kitOf";
import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import { Pending } from "../../../platform/blueprint/Pending";
import type { Table } from "../../../platform/blueprint/Table";
import type { RunningYear } from "../../../platform/data/RunningYear";
import type { HourlySums, No2Station } from "../No2Station";
import { airNodes } from "./airNodes";
import { no2DaysChoice } from "./no2DaysChoice";
import { no2HoursNode } from "./no2HoursNode";
import { no2MonthsNode } from "./no2MonthsNode";
import { no2StationChoice } from "./no2StationChoice";
import { no2StationsNode } from "./no2StationsNode";
import { no2StationsRead } from "./no2StationsRead";
import { no2YearsNode } from "./no2YearsNode";

/** Every month and hour measured `count` times, at a level that is the month, the hour and a base added up. */
function sums(base: number, count: number, months = 12): HourlySums {
  const grid = (value: (month: number, hour: number) => number) => Array.from({ length: 12 }, (_, month) => Array.from({ length: 24 }, (_, hour) => (month < months ? value(month, hour) : 0)));
  return { sums: grid((month, hour) => (base + month + hour) * count), counts: grid(() => count) };
}

const station: No2Station = {
  code: "08019004",
  name: "Barcelona (Poblenou)",
  kind: "background",
  area: "urban",
  years: { "2024": { workdays: sums(30, 20), weekends: sums(10, 8) }, "2025": { workdays: sums(20, 20), weekends: sums(10, 8) } },
};
const running: RunningYear<No2Station> = { year: 2026, through: "2026-01-31", refreshed: "2026-10-02", files: { "08019004.json": { ...station, years: { "2026": { workdays: sums(10, 20, 1), weekends: sums(10, 8, 1) } } } } };
const files = (withRunning: boolean): Record<string, string> => ({
  "/data/no2/index.json": JSON.stringify({ attribution: "Generalitat de Catalunya, XVPCA.", dataset: "https://example.org", years: [2024, 2025], refreshed: "2026-09-21" }),
  "/data/no2/08019004.json": JSON.stringify(station),
  ...(withRunning && { "/data/no2/running.json": JSON.stringify(running) }),
});
const reading = (held: Record<string, string>) => ({
  read: (path: string) => {
    const text = held[path];
    if (text === undefined) throw new Error(`no ${path}`);
    return text;
  },
});
const tableOf = (kind: NodeKind, inputs: Record<string, unknown>, withRunning = false) => kind.run(inputs, reading(files(withRunning))).outputs?.["table"] as Table;

describe("the measuring points a NO2 node reads", () => {
  it("are one, or every one, crediting the network with the day the copy was brought up to date", () => {
    expect(no2StationsRead(reading(files(true)).read, "08019004").credit).toEqual({ said: "Generalitat de Catalunya, XVPCA.", refreshed: "2026-10-02" });
  });

  it("wait for the year still running while it is on its way", () => {
    const pending = (path: string) => {
      if (path.endsWith("running.json")) throw new Pending(path);
      return files(false)[path] ?? "";
    };
    expect(() => no2StationsRead(pending, "08019004")).toThrow(Pending);
  });

  it("are offered by name, and the days by what they are", () => {
    expect(no2StationChoice.kind === "choice" && no2StationChoice.choices[0]).toEqual({ value: "08019004", label: "Barcelona (Poblenou)" });
    expect(no2DaysChoice.kind === "choice" && no2DaysChoice.choices.map((choice) => choice.value)).toEqual(["all", "workdays", "weekends"]);
  });
});

describe("a measuring point, month by month", () => {
  it("is the mean of every hour measured on the days asked for, each hour weighing what it measured", () => {
    const table = tableOf(no2MonthsNode, { station: "08019004", days: "workdays" });
    expect(table.rows.length).toBe(24);
    expect(table.rows[0]).toMatchObject({ year: 2024, month: 1, season: "winter", no2: 30 + 11.5, hours: 20 * 24 });
    const every = tableOf(no2MonthsNode, { station: "08019004", days: "all" });
    expect(every.rows[0]?.["no2"]).toBeCloseTo((20 * 41.5 + 8 * 21.5) / 28, 6);
    expect(every.rows[0]?.["measured"]).toBeCloseTo((28 * 24) / (31 * 24), 6);
  });

  it("goes on into the year still running", () => {
    expect(tableOf(no2MonthsNode, { station: "08019004", days: "all" }, true).rows.at(-1)).toMatchObject({ year: 2026, month: 1 });
  });
});

describe("a measuring point, year by year", () => {
  it("marks the year still running as not whole", () => {
    const table = tableOf(no2YearsNode, { station: "08019004", days: "all" }, true);
    expect(table.rows.map((row) => [row["year"], row["whole"]])).toEqual([
      [2024, "yes"],
      [2025, "yes"],
      [2026, "no"],
    ]);
  });
});

describe("a measuring point's day, hour by hour", () => {
  it("is a row for each month and hour, the hours numbered 1 to 24 as the network numbers them", () => {
    const ran = no2HoursNode.run({ station: "08019004", days: "workdays", from: 2025 }, reading(files(false)));
    const table = ran.outputs?.["table"] as Table;
    expect(table.rows.length).toBe(12 * 24);
    expect(table.rows[0]).toMatchObject({ month: 1, hour: 1, no2: 20 });
    expect(table.columns.find((column) => column.name === "hour")?.about).toContain("does not say by which clock");
    expect(ran.settled).toEqual({ from: 2025, to: 2025 });
  });

  it("is, asked for each year, a row for each year, month and hour, with the season of the month", () => {
    const table = no2HoursNode.run({ station: "08019004", days: "workdays", years: "each" }, reading(files(false))).outputs?.["table"] as Table;
    expect(table.rows.length).toBe(2 * 12 * 24);
    expect(table.rows[0]).toMatchObject({ year: 2024, month: 1, season: "winter", hour: 1, no2: 30 });
    expect(table.rows.at(-1)).toMatchObject({ year: 2025, month: 12, season: "winter", hour: 24, no2: 20 + 11 + 23 });
    expect(table.columns.filter((column) => column.key).map((column) => column.name)).toEqual(["year", "month", "season", "hour"]);
  });

  it("is of one measuring point at a time", () => {
    expect(() => no2HoursNode.run({ station: "all", days: "all" }, reading(files(false)))).toThrow("the hours are of one measuring point at a time");
  });
});

describe("the measuring points themselves", () => {
  it("say what the network says each measures", () => {
    expect(tableOf(no2StationsNode, {}).rows[0]).toEqual({ station: "08019004", name: "Barcelona (Poblenou)", kind: "background", area: "urban" });
  });

  it("stand beside the rest of what the air brings, found by name", () => {
    expect([...kitOf(airNodes, coreTypes).kinds.keys()]).toEqual(["no2-months", "no2-years", "no2-hours", "no2-stations"]);
  });
});

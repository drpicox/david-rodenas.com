import { describe, expect, it } from "vitest";
import type { Ran } from "../../../platform/blueprint/NodeKind";
import { correlationNode } from "../../../platform/blueprint/nodes/correlationNode";
import { joinNode } from "../../../platform/blueprint/nodes/joinNode";
import { keepNode } from "../../../platform/blueprint/nodes/keepNode";
import { seasonNode } from "../../../platform/blueprint/nodes/seasonNode";
import type { Row, Table } from "../../../platform/blueprint/Table";
import { crossNode } from "./crossNode";
import { dayPartsNode } from "./dayPartsNode";

const context = {
  read: () => {
    throw new Error("no files here");
  },
};
const tableOf = (ran: Ran) => ran.outputs?.["table"] as Table;

/** A number that looks random and is the same every time: the n-th of a little generator. */
const noise = (n: number) => (((n * 9301 + 49297) % 233280) / 233280 - 0.5) * 4;
const months = [2021, 2022, 2023].flatMap((year) => Array.from({ length: 12 }, (_, at) => ({ year, month: at + 1, n: (year - 2021) * 12 + at })));
const heat: Table = {
  columns: [
    { name: "year", kind: "number", key: true },
    { name: "month", kind: "number", key: true },
    { name: "tx", kind: "number", unit: "°C" },
    { name: "whole", kind: "text" },
  ],
  rows: months.map(({ year, month, n }): Row => ({ year, month, tx: 18 + 8 * Math.sin(month / 2) + (year - 2021) * 0.4 + noise(n), whole: n === 35 ? "no" : "yes" })),
  credits: [{ said: "The heat." }],
};
const air: Table = {
  columns: [
    { name: "year", kind: "number", key: true },
    { name: "month", kind: "number", key: true },
    { name: "no2", kind: "number", unit: "µg/m³" },
  ],
  rows: months.map(({ year, month, n }): Row => ({ year, month, no2: 40 - 1.5 * (18 + 8 * Math.sin(month / 2)) - (year - 2021) * 2 + noise(n + 7) })),
  credits: [{ said: "The air." }],
};

describe("two sources crossed in one node", () => {
  /** The same, done by the small nodes one after another, as the examples do it. */
  const chained = (out: "nothing" | "season" | "both") => {
    const whole = tableOf(keepNode.run({ table: tableOf(joinNode.run({ left: heat, right: air }, context)), column: "whole", is: "equals", value: "yes" }, context));
    const seasonless = out === "nothing" ? whole : tableOf(seasonNode.run({ table: whole, by: "month" }, context));
    const left = out === "both" ? tableOf(seasonNode.run({ table: seasonless, by: "year" }, context)) : seasonless;
    return correlationNode.run({ table: left, x: "tx", y: "no2", of: "values" }, context).outputs?.["r"] as number;
  };

  it("is the chain of small nodes it stands for: joined, kept to what was measured whole, a column of each correlated", () => {
    const ran = crossNode.run({ left: heat, right: air, out: "nothing" }, context);
    expect(ran.outputs?.["r"]).toBeCloseTo(chained("nothing"), 12);
    expect(tableOf(ran).rows.length).toBe(35);
    expect(ran.settled).toEqual({ x: "tx", y: "no2" });
    expect(ran.painting?.html).toContain("<svg");
  });

  it("takes the season out when asked, and the years too", () => {
    expect(crossNode.run({ left: heat, right: air, out: "season" }, context).outputs?.["r"]).toBeCloseTo(chained("season"), 12);
    expect(crossNode.run({ left: heat, right: air, out: "both" }, context).outputs?.["r"]).toBeCloseTo(chained("both"), 12);
  });

  it("says what the correlation says, and takes nothing out of what is not months of years, nor keeps what has no say on being whole", () => {
    const station: Table["columns"][number] = { name: "station", kind: "text", key: true };
    const yearly = (table: Table): Table => ({ ...table, columns: [station, ...table.columns.filter((column) => column.name !== "month" && column.name !== "whole")], rows: table.rows.filter((row) => row["month"] === 1).map(({ month, whole, ...rest }) => ({ station: "XJ", ...rest })) });
    const ran = crossNode.run({ left: yearly(heat), right: yearly(air), out: "both" }, context);
    const plain = correlationNode.run({ table: tableOf(joinNode.run({ left: yearly(heat), right: yearly(air) }, context)), x: "tx", y: "no2", of: "values" }, context);
    expect(ran.outputs?.["r"]).toBe(plain.outputs?.["r"]);
    expect(ran.said).toBe(plain.said);
  });

  it("finds the other's column where the join had to rename it", () => {
    const same: Table = { ...air, columns: air.columns.map((column) => (column.name === "no2" ? { ...column, name: "tx" } : column)), rows: air.rows.map(({ no2, ...rest }) => ({ ...rest, tx: no2 ?? null })) };
    expect(crossNode.run({ left: heat, right: same, x: "tx", y: "tx", out: "nothing" }, context).outputs?.["r"]).toBeCloseTo(chained("nothing"), 12);
  });
});

describe("two times of a day compared in one node", () => {
  const hours: Table = {
    columns: [
      { name: "year", kind: "number", key: true },
      { name: "month", kind: "number", key: true },
      { name: "hour", kind: "number", key: true },
      { name: "no2", kind: "number", unit: "µg/m³" },
    ],
    rows: [2024, 2025].flatMap((year) => [1, 2].flatMap((month) => Array.from({ length: 24 }, (_, at): Row => ({ year, month, hour: at + 1, no2: at + 1 + month * 10 + (year - 2024) })))),
    credits: [],
  };

  it("is a row for every day the hours make up, with the mean of each time and how much the second rose over the first", () => {
    const table = tableOf(dayPartsNode.run({ table: hours, first: "13 16", second: "19 22" }, context));
    expect(table.columns.map((column) => [column.name, column.unit ?? ""])).toEqual([
      ["year", ""],
      ["month", ""],
      ["early", "µg/m³"],
      ["late", "µg/m³"],
      ["rise", "µg/m³"],
    ]);
    expect(table.rows[0]).toEqual({ year: 2024, month: 1, early: 24.5, late: 30.5, rise: 6 });
    expect(table.rows.length).toBe(4);
  });

  it("needs the hours of a day to compare", () => {
    expect(() => dayPartsNode.run({ table: { ...hours, columns: hours.columns.filter((column) => column.name !== "hour") }, first: "13 16", second: "19 22" }, context)).toThrow("hour");
  });

});

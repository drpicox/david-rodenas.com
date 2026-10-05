import { describe, expect, it } from "vitest";
import type { NodeKind } from "../NodeKind";
import type { Table } from "../Table";
import { correlationNode } from "./correlationNode";
import { histogramNode } from "./histogramNode";
import { numericPairs } from "./numericPairs";
import { summaryNode } from "./summaryNode";
import { trendNode } from "./trendNode";

const ran = (kind: NodeKind, inputs: Record<string, unknown>) => kind.run(inputs, { read: () => "" });

const nights: Table = {
  columns: [
    { name: "year", kind: "number", key: true },
    { name: "days", kind: "number", unit: "nights" },
    { name: "rain", kind: "number" },
  ],
  rows: [
    { year: 2000, days: 10, rain: 400 },
    { year: 2001, days: 12, rain: 380 },
    { year: 2002, days: 15, rain: 370 },
    { year: 2003, days: null, rain: 300 },
    { year: 2004, days: 18, rain: 360 },
  ],
  credits: [{ said: "Meteocat." }],
};

describe("only the rows where two columns both hold a number", () => {
  it("pairs them up, leaving out any row where either holds nothing", () => {
    expect(numericPairs(nights, "year", "days")).toMatchObject({ xs: [2000, 2001, 2002, 2004], ys: [10, 12, 15, 18] });
  });
});

describe("a column summed up", () => {
  it("gives each figure as a number to wire on, and all of them as a table", () => {
    const { outputs, said } = ran(summaryNode, { table: nights, column: "days" });
    expect(outputs).toMatchObject({ mean: 13.75, median: 13.5, lowest: 10, highest: 18, count: 4 });
    expect((outputs?.["table"] as Table).rows[0]).toEqual({ figure: "mean", days: 13.75 });
    expect(said).toBe("mean 13.75 nights of 4");
  });
});

describe("a correlation", () => {
  it("is r over the rows that have both, with the line fitted through them", () => {
    const { outputs, said, settled } = ran(correlationNode, { table: nights, x: "year", y: "days", of: "values" });
    expect(outputs?.["r"]).toBeCloseTo(0.9898, 3);
    expect(outputs?.["n"]).toBe(4);
    expect(said).toBe("r = 0.99 over 4 rows");
    expect(settled).toEqual({ x: "year", y: "days" });
  });

  it("of the ranks, asks only whether more goes with more", () => {
    expect(ran(correlationNode, { table: nights, x: "year", y: "days", of: "ranks" }).outputs?.["r"]).toBe(1);
  });

  it("refuses to say anything of too few rows, or of a column that never moves", () => {
    const two: Table = { ...nights, rows: nights.rows.slice(0, 2) };
    expect(() => ran(correlationNode, { table: two, x: "year", y: "days", of: "values" })).toThrow("only 2 rows have both year and days");
    const flat: Table = { ...nights, rows: nights.rows.map((row) => ({ ...row, rain: 1 })) };
    expect(() => ran(correlationNode, { table: flat, x: "year", y: "rain", of: "values" })).toThrow("rain never changes, so nothing can go with it");
  });
});

describe("a trend", () => {
  it("goes along the years when the table has them, and says how much a decade", () => {
    const { outputs, said } = ran(trendNode, { table: nights, y: "days" });
    expect(outputs?.["slope"]).toBeCloseTo(2.0286, 3);
    expect(outputs?.["per-ten"]).toBeCloseTo(20.29, 1);
    expect(said).toBe("+20.29 nights a decade");
  });
});

describe("a histogram", () => {
  it("cuts the range into bins with round edges, and counts the values in each, the last bin holding its top edge", () => {
    const table = ran(histogramNode, { table: nights, column: "rain", bins: 4 }).outputs?.["table"] as Table;
    expect(table.rows).toEqual([
      { from: 300, to: 325, count: 1 },
      { from: 325, to: 350, count: 0 },
      { from: 350, to: 375, count: 2 },
      { from: 375, to: 400, count: 2 },
    ]);
  });
});

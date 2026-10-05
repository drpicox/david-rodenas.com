import { describe, expect, it } from "vitest";
import { pickColumn } from "./pickColumn";
import type { Table } from "./Table";

const table: Table = {
  columns: [
    { name: "station", kind: "text", key: true },
    { name: "year", kind: "number", key: true },
    { name: "tx", kind: "number", unit: "°C" },
    { name: "no2", kind: "number", unit: "µg/m³" },
  ],
  rows: [],
};

describe("the column a node works on", () => {
  it("is the one asked for by name", () => {
    expect(pickColumn(table, "no2", "y")).toEqual(table.columns[3]);
  });

  it("refuses, in words, a name the table has not got, and says the ones it has", () => {
    expect(() => pickColumn(table, "rain", "y")).toThrow("y: the table has no column rain — it has station, year, tx, no2");
  });

  it("refuses words where numbers are wanted", () => {
    expect(() => pickColumn(table, "station", "y", { numeric: true })).toThrow("y: station holds words, and this needs numbers");
  });

  it("left to the node, is the first that fits and is not taken already, measured before keys", () => {
    expect(pickColumn(table, undefined, "x")).toEqual(table.columns[0]);
    expect(pickColumn(table, undefined, "y", { numeric: true, besides: ["tx"] })).toEqual(table.columns[1]);
    expect(pickColumn(table, undefined, "y", { numeric: true, measured: true })).toEqual(table.columns[2]);
    expect(pickColumn(table, undefined, "y", { numeric: true, measured: true, besides: ["tx"] })).toEqual(table.columns[3]);
  });

  it("says when nothing fits", () => {
    expect(() => pickColumn({ columns: [{ name: "station", kind: "text" }], rows: [] }, undefined, "y", { numeric: true })).toThrow("y: the table has no column of numbers");
  });
});

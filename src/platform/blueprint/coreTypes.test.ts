import { describe, expect, it } from "vitest";
import { coreTypes } from "./coreTypes";
import type { Table } from "./Table";

const type = (name: string) => coreTypes.find((each) => each.name === name)!;

const months: Table = {
  columns: [
    { name: "year", kind: "number" },
    { name: "month", kind: "number" },
    { name: "tx", kind: "number", unit: "°C" },
  ],
  rows: [
    { year: 2024, month: 7, tx: 31.2 },
    { year: 2024, month: 8, tx: 32 },
  ],
};

describe("what flows along the wires every blueprint has", () => {
  it("says a table by its rows and its columns", () => {
    expect(type("table").describe(months)).toBe("2 rows · year, month, tx");
  });

  it("says one row as a row, and long lists of columns short", () => {
    const wide: Table = { columns: "abcdefgh".split("").map((name) => ({ name, kind: "number" as const })), rows: [{}] };
    expect(type("table").describe(wide)).toBe("1 row · a, b, c, d, e, f +2");
  });

  it("says a number as it would be read, words as they are, and yes and no", () => {
    expect(type("number").describe(-0.4213)).toBe("−0.421");
    expect(type("text").describe("year month")).toBe("“year month”");
    expect(type("flag").describe(true)).toBe("yes");
  });

  it("lets a dial's value go into a number, some words, or yes and no, made into each", () => {
    const into = type("value").becomes!;
    expect(into["number"]?.("12.5")).toBe(12.5);
    expect(into["text"]?.(8019058)).toBe("8019058");
    expect(into["flag"]?.("yes")).toBe(true);
    expect(into["flag"]?.(false)).toBe(false);
  });

  it("colours each by a custom property of its own", () => {
    expect(coreTypes.map((each) => each.colour)).toEqual(["--bp-number", "--bp-text", "--bp-flag", "--bp-table", "--bp-value"]);
  });
});

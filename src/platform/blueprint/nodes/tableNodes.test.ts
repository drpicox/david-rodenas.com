import { describe, expect, it } from "vitest";
import type { NodeKind } from "../NodeKind";
import type { Table } from "../Table";
import { creditLines } from "./creditLines";
import { formulaNode } from "./formulaNode";
import { groupNode } from "./groupNode";
import { joinNode } from "./joinNode";
import { keepNode } from "./keepNode";
import { mergedCredits } from "./mergedCredits";
import { seasonNode } from "./seasonNode";
import { sortNode } from "./sortNode";
import { stackNode } from "./stackNode";
import { topNode } from "./topNode";
import { yourDataNode } from "./yourDataNode";
import { ROW_TESTS } from "../ROW_TESTS";

const read = () => {
  throw new Error("no files here");
};
const ran = (kind: NodeKind, inputs: Record<string, unknown>) => kind.run(inputs, { read });
const out = (kind: NodeKind, inputs: Record<string, unknown>) => ran(kind, inputs).outputs?.["table"] as Table;

const heat: Table = {
  columns: [
    { name: "year", kind: "number", key: true },
    { name: "month", kind: "number", key: true },
    { name: "tx", kind: "number", unit: "°C" },
    { name: "tn", kind: "number", unit: "°C" },
  ],
  rows: [
    { year: 2023, month: 1, tx: 14, tn: 6 },
    { year: 2023, month: 7, tx: 30, tn: 22 },
    { year: 2024, month: 1, tx: 16, tn: 8 },
    { year: 2024, month: 7, tx: 32, tn: null },
  ],
  credits: [{ said: "Meteocat.", refreshed: "2026-10-02" }],
};
const air: Table = {
  columns: [
    { name: "year", kind: "number", key: true },
    { name: "month", kind: "number", key: true },
    { name: "no2", kind: "number", unit: "µg/m³" },
    { name: "tx", kind: "number" },
  ],
  rows: [
    { year: 2023, month: 1, no2: 40, tx: 1 },
    { year: 2023, month: 7, no2: 20, tx: 2 },
    { year: 2024, month: 7, no2: 18, tx: 3 },
  ],
  credits: [{ said: "XVPCA." }],
};
const tx = (table: Table) => table.rows.map((row) => row["tx"]);

describe("keeping some rows", () => {
  it("keeps the rows whose column is as asked, comparing numbers as numbers", () => {
    expect(tx(out(keepNode, { table: heat, column: "tx", is: "at-least", value: "16" }))).toEqual([30, 16, 32]);
    expect(tx(out(keepNode, { table: heat, column: "month", is: "equals", value: "7" }))).toEqual([30, 32]);
    expect(tx(out(keepNode, { table: heat, column: "month", is: "one-of", value: "1, 12" }))).toEqual([14, 16]);
  });

  it("says how many it kept of how many, and keeps the table's credits", () => {
    const result = ran(keepNode, { table: heat, column: "tx", is: "below", value: "20" });
    expect(result.said).toBe("2 of 4 rows");
    expect((result.outputs?.["table"] as Table).credits).toEqual(heat.credits);
  });

  it("drops a row whose column holds nothing, unless what is asked is that it hold nothing", () => {
    expect(out(keepNode, { table: heat, column: "tn", is: "differs", value: "6" }).rows.length).toBe(2);
    expect(tx(out(keepNode, { table: heat, column: "tn", is: "is-empty" }))).toEqual([32]);
    expect(tx(out(keepNode, { table: heat, column: "tn", is: "has-a-value" }))).toEqual([14, 30, 16]);
  });

  it("keeps the rows between two values, both ends in", () => {
    expect(tx(out(keepNode, { table: heat, column: "tx", is: "between", value: "16 30" }))).toEqual([30, 16]);
  });

  it("says each test as a reader would read it", () => {
    expect(Object.values(ROW_TESTS).map((test) => test.label)).toEqual(["equals", "differs from", "is below", "is at most", "is above", "is at least", "is between", "is one of", "contains", "has a value", "is empty"]);
    expect(ROW_TESTS["between"]?.test("b", "a c")).toBe(true);
  });
});

describe("sorting, and the first rows", () => {
  it("sorts by a column, rising or falling, with what holds nothing last", () => {
    expect(out(sortNode, { table: heat, by: "tn", order: "falling" }).rows.map((row) => row["tn"])).toEqual([22, 8, 6, null]);
  });

  it("takes the rows with the most of a column, or the least", () => {
    expect(tx(out(topNode, { table: heat, by: "tx", count: 2, end: "highest" }))).toEqual([32, 30]);
    expect(tx(out(topNode, { table: heat, by: "tx", count: 1, end: "lowest" }))).toEqual([14]);
  });

  it("takes them, asked to, from each group of rows that share a column, a group after another", () => {
    const hottest = out(topNode, { table: heat, by: "tx", count: 1, end: "highest", per: "month" });
    expect(hottest.rows.map((row) => [row["month"], row["tx"]])).toEqual([
      [1, 16],
      [7, 32],
    ]);
  });
});

describe("grouping rows, and summing each group up", () => {
  it("makes a row a group, its keys first, then the column summed up as asked, then how many rows it had", () => {
    const yearly = out(groupNode, { table: heat, by: "year", value: "tx", how: "mean" });
    expect(yearly.columns.map((column) => [column.name, column.key ?? false])).toEqual([["year", true], ["tx", false], ["rows", false]]);
    expect(yearly.rows).toEqual([{ year: 2023, tx: 22, rows: 2 }, { year: 2024, tx: 24, rows: 2 }]);
  });

  it("groups by two columns, and leaves out of a mean what holds nothing", () => {
    const monthly = out(groupNode, { table: heat, by: "month", and: "year", value: "tn", how: "highest" });
    expect(monthly.rows).toEqual([
      { month: 1, year: 2023, tn: 6, rows: 1 },
      { month: 1, year: 2024, tn: 8, rows: 1 },
      { month: 7, year: 2023, tn: 22, rows: 1 },
      { month: 7, year: 2024, tn: null, rows: 1 },
    ]);
  });

  it("calls the column it sums up what it is asked to, so two groupings of one column can be joined and told apart", () => {
    const evenings = out(groupNode, { table: heat, by: "year", value: "tx", how: "highest", name: "hottest" });
    expect(evenings.columns.map((column) => column.name)).toEqual(["year", "hottest", "rows"]);
    expect(evenings.rows[1]).toEqual({ year: 2024, hottest: 32, rows: 2 });
  });

  it("counts, with nothing to sum up", () => {
    expect(out(groupNode, { table: heat, by: "month", how: "count" }).rows).toEqual([{ month: 1, rows: 2 }, { month: 7, rows: 2 }]);
  });
});

describe("joining two tables", () => {
  it("matches rows on the keys both have, and keeps every column of both, renaming the second of two of a name", () => {
    const both = ran(joinNode, { left: heat, right: air });
    const table = both.outputs?.["table"] as Table;
    expect(table.columns.map((column) => column.name)).toEqual(["year", "month", "tx", "tn", "no2", "tx2"]);
    expect(table.rows).toEqual([
      { year: 2023, month: 1, tx: 14, tn: 6, no2: 40, tx2: 1 },
      { year: 2023, month: 7, tx: 30, tn: 22, no2: 20, tx2: 2 },
      { year: 2024, month: 7, tx: 32, tn: null, no2: 18, tx2: 3 },
    ]);
    expect(both.settled).toEqual({ on: "year month" });
    expect(both.said).toBe("3 rows matched, of 4 and 3");
    expect(table.columns.filter((column) => column.joined).map((column) => column.name)).toEqual(["no2", "tx2"]);
  });

  it("owes the credits of both", () => {
    expect(creditLines(out(joinNode, { left: heat, right: air }))).toEqual(["Meteocat. Brought up to date 2026-10-02.", "XVPCA."]);
    expect(mergedCredits(heat, heat)).toEqual(heat.credits);
  });

  it("matches on the columns it is told to, and refuses one a table has not got", () => {
    expect(out(joinNode, { left: heat, right: air, on: "year" }).rows.length).toBe(2 * 2 + 2 * 1);
    expect(() => ran(joinNode, { left: heat, right: air, on: "station" })).toThrow("on: the left table has no column station");
  });
});

describe("a new column, worked out of the others", () => {
  it("adds the column a formula makes, with nothing where a column it reads has nothing", () => {
    const range = out(formulaNode, { table: heat, name: "range", formula: "tx - tn", unit: "°C" });
    expect(range.columns.at(-1)).toEqual({ name: "range", kind: "number", unit: "°C", about: "tx - tn" });
    expect(range.rows.map((row) => row["range"])).toEqual([8, 8, 8, null]);
  });

  it("refuses a formula that reads a column the table has not got", () => {
    expect(() => ran(formulaNode, { table: heat, name: "x", formula: "rain * 2" })).toThrow("formula: the table has no column rain");
  });
});

describe("the season taken out", () => {
  it("takes from each value the mean of its month, so what is left is how unusual it was", () => {
    const anomalies = out(seasonNode, { table: heat, column: "tx", by: "month" });
    expect(tx(anomalies)).toEqual([-1, -1, 1, 1]);
    expect(anomalies.columns.find((column) => column.name === "tx")?.about).toBe("tx less its month's mean");
  });

  it("does every measured column when none is named", () => {
    const anomalies = out(seasonNode, { table: heat, by: "month" });
    expect(anomalies.rows.map((row) => row["tn"])).toEqual([-1, 0, 1, null]);
    expect(anomalies.rows.map((row) => row["year"])).toEqual([2023, 2023, 2024, 2024]);
  });
});

describe("two tables stacked", () => {
  it("puts the rows of one under the other's, with a column that says where each came from", () => {
    const stacked = out(stackNode, { a: heat, b: air, "a-name": "Fabra", "b-name": "Eixample" });
    expect(stacked.columns.map((column) => column.name)).toEqual(["from", "year", "month", "tx", "tn", "no2"]);
    expect(stacked.rows.length).toBe(7);
    expect(stacked.rows[6]).toEqual({ from: "Eixample", year: 2024, month: 7, tx: 3, tn: null, no2: 18 });
  });
});

describe("your own numbers", () => {
  it("reads a table pasted as text, its first line the names, numbers as numbers", () => {
    const table = out(yourDataNode, { text: "year, rain\n2023, 410.5\n2024, 389" });
    expect(table.columns).toEqual([{ name: "year", kind: "number" }, { name: "rain", kind: "number" }]);
    expect(table.rows).toEqual([{ year: 2023, rain: 410.5 }, { year: 2024, rain: 389 }]);
  });

  it("takes semicolons or tabs between values, and a comma for a decimal point then", () => {
    const table = out(yourDataNode, { text: "city;temp\nGirona;15,5\nLleida;" });
    expect(table.columns).toEqual([{ name: "city", kind: "text" }, { name: "temp", kind: "number" }]);
    expect(table.rows).toEqual([{ city: "Girona", temp: 15.5 }, { city: "Lleida", temp: null }]);
  });

  it("says what it needs, given nothing", () => {
    expect(() => ran(yourDataNode, { text: " " })).toThrow("paste a table: a first line of names, then a line a row");
  });
});

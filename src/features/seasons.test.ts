import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { NodeKind } from "../platform/blueprint/NodeKind";
import type { Table } from "../platform/blueprint/Table";
import { seasonOf } from "../platform/data/seasonOf";
import { no2MonthsNode } from "./air-quality/nodes/no2MonthsNode";
import { seaMonthsNode } from "./sea/nodes/seaMonthsNode";
import { weatherMonthsNode } from "./weather/nodes/weatherMonthsNode";

const PUBLIC = new URL("../../public", import.meta.url).pathname;
const read = (path: string) => readFileSync(join(PUBLIC, path), "utf8");
const tableOf = (kind: NodeKind, inputs: Record<string, unknown>) => kind.run(inputs, { read }).outputs?.["table"] as Table;

/**
 * The weather, the air and the sea each say the season of a month, and nothing but
 * this holds them to saying it alike: a join of the two matches on it, and a
 * legend names it, so a month put in another season by one of them, or a
 * season named in another order, would cross the two wrongly and say nothing.
 */
describe("the seasons, as every source of months names them", () => {
  const tables = [tableOf(weatherMonthsNode, { station: "WU" }), tableOf(no2MonthsNode, { station: "08019004", days: "all" }), tableOf(seaMonthsNode, { point: "barcelona" })];

  it("are one column, said and ordered alike", () => {
    const [weather, ...others] = tables.map((table) => table.columns.find((column) => column.name === "season"));
    for (const other of others) expect(other).toEqual(weather);
    expect(weather?.order).toEqual(["winter", "spring", "summer", "autumn"]);
  });

  it("put each month in the season the meteorologists put it in", () => {
    for (const table of tables) expect(table.rows.filter((row) => row["season"] !== seasonOf(Number(row["month"])))).toEqual([]);
  });
});

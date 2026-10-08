import { describe, expect, it } from "vitest";
import { coreTypes } from "../../../platform/blueprint/coreTypes";
import { kitOf } from "../../../platform/blueprint/kitOf";
import type { NodeKind } from "../../../platform/blueprint/NodeKind";
import type { Table } from "../../../platform/blueprint/Table";
import { barcelonaMonthsNode } from "./barcelonaMonthsNode";
import { barcelonaNodes } from "./barcelonaNodes";
import { barcelonaRead } from "./barcelonaRead";
import { barcelonaYearsNode } from "./barcelonaYearsNode";

const TWELVE = [6.7, 7.3, 11.6, 11.4, 16.3, 19.1, 21.4, 22, 20.3, 16.3, 9.2, 7.3];
const served: Record<string, string> = {
  "/data/barcelona-series/index.json": JSON.stringify({ attribution: "Servei Meteorològic de Catalunya: the climate series of Barcelona since 1780.", dataset: "https://example.org", years: [1780, 1781], refreshed: "2026-10-08" }),
  "/data/barcelona-series/temperature.json": JSON.stringify({ years: { 1780: TWELVE, 1781: [null, ...TWELVE.slice(1)] } }),
};
const read = (path: string) => {
  const text = served[path];
  if (text === undefined) throw new Error(`no ${path}`);
  return text;
};
const tableOf = (kind: NodeKind) => kind.run({}, { read }).outputs?.["table"] as Table;

describe("Barcelona since 1780, year by year", () => {
  it("is a row a year, with the mean of its twelve months, and none for a year that misses one", () => {
    expect(tableOf(barcelonaYearsNode).rows).toEqual([
      { year: 1780, mean: 14.08, whole: "yes" },
      { year: 1781, mean: null, whole: "no" },
    ]);
  });

});

describe("the series a node reads", () => {
  it("is every year the site keeps, credited to the Meteocat with the day the copy was brought up to date", () => {
    const { series, credit } = barcelonaRead(read);
    expect(Object.keys(series.years)).toEqual(["1780", "1781"]);
    expect(credit).toEqual({ said: "Servei Meteorològic de Catalunya: the climate series of Barcelona since 1780.", refreshed: "2026-10-08" });
    expect(tableOf(barcelonaYearsNode).credits).toEqual([credit]);
  });
});

describe("Barcelona since 1780, month by month", () => {
  it("is a row a month that has a mean, in the season the meteorologists put it in", () => {
    const rows = tableOf(barcelonaMonthsNode).rows;
    expect(rows.length).toBe(23);
    expect(rows[0]).toEqual({ year: 1780, month: 1, season: "winter", mean: 6.7 });
    expect(rows[7]).toEqual({ year: 1780, month: 8, season: "summer", mean: 22 });
  });
});

describe("what Barcelona's series brings a blueprint", () => {
  it("is found by name beside the nodes every blueprint has, on a shelf of its own", () => {
    expect(barcelonaNodes.map((kind) => kind.name)).toEqual(["barcelona-years", "barcelona-months"]);
    expect(kitOf(barcelonaNodes, coreTypes).kinds.has("barcelona-years")).toBe(true);
    expect(barcelonaNodes.every((kind) => kind.shelf === "Barcelona")).toBe(true);
  });
});

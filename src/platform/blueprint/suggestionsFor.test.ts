import { describe, expect, it } from "vitest";
import { aKit } from "./aKit";
import type { Blueprint, PlacedNode } from "./Blueprint";
import { coreNodes } from "./coreNodes";
import { coreTypes } from "./coreTypes";
import type { Done, Evaluation } from "./Evaluation";
import { kitOf } from "./kitOf";
import type { NodeKind } from "./NodeKind";
import { suggestionsFor } from "./suggestionsFor";
import type { Column, Row, Table } from "./Table";

const done = (outputs: Record<string, unknown>): Done => ({ state: "done", inputs: {}, outputs, settled: {}, said: "", key: [] });
const placed = (id: string, kind = "your-data", title?: string): PlacedNode => ({ id, kind, x: 0, y: 0, values: {}, ...(title && { title }) });
const table = (columns: Column[], rows: Row[] = []): Table => ({ columns, rows, credits: [] });
const year: Column = { name: "year", kind: "number", key: true };
const month: Column = { name: "month", kind: "number", key: true };
const season: Column = { name: "season", kind: "text", key: true };
const hour: Column = { name: "hour", kind: "number", key: true };

/** What is offered after a node that gave a table, alone on the canvas or beside others. */
function after(given: Table, others: Record<string, Table> = {}) {
  const blueprint: Blueprint = { nodes: [placed("a"), ...Object.keys(others).map((id) => placed(id, "your-data", `The ${id}`))], wires: [] };
  const evaluation: Evaluation = new Map([["a", done({ table: given })], ...Object.entries(others).map(([id, other]) => [id, done({ table: other })] as const)]);
  return suggestionsFor(blueprint, "a", aKit, evaluation);
}
const labels = (offered: ReturnType<typeof after>) => offered.map((each) => each.label);
const offer = (offered: ReturnType<typeof after>, label: string) => offered.find((each) => each.label === label);

describe("what is offered to come next", () => {
  it("is, after the years of something, the years measured whole, their bars and their trend", () => {
    const offered = after(table([year, { name: "nights", kind: "number", unit: "nights" }, { name: "whole", kind: "text" }], [{ year: 2024, nights: 30, whole: "yes" }, { year: 2025, nights: 12, whole: "no" }]));
    expect(offered[0]).toEqual({ label: "Only what was measured whole", kind: "keep", from: "table", into: "table", values: { column: "whole", is: "equals", value: "yes" } });
    expect(offer(offered, "Bars of nights, year by year")).toMatchObject({ kind: "bars", values: { x: "year", y: "nights", faded: "whole" } });
    expect(offer(offered, "Trend of nights")).toMatchObject({ kind: "trend", values: { x: "year", y: "nights" } });
  });

  it("is, after months of many years, a row a year, a heat map, and the season taken out", () => {
    const offered = after(table([year, month, season, { name: "tn", kind: "number", unit: "°C" }]));
    expect(offer(offered, "Heat map of tn: month by year")).toMatchObject({ kind: "heatmap", values: { x: "month", y: "year", value: "tn" } });
    expect(offer(offered, "Mean of tn by year")).toMatchObject({ kind: "group", values: { by: "year", value: "tn", how: "mean" } });
    expect(offer(offered, "Take the season out")).toMatchObject({ kind: "season", values: { by: "month" } });
  });

  it("is, after the hours of every month, their mean an hour and a season, and a heat map of the day", () => {
    const offered = after(table([month, season, hour, { name: "no2", kind: "number", unit: "µg/m³" }]));
    expect(offer(offered, "Mean of no2 by hour and season")).toMatchObject({ kind: "group", values: { by: "hour", and: "season", value: "no2", how: "mean" } });
    expect(offer(offered, "Heat map of no2: month by hour")).toMatchObject({ kind: "heatmap", values: { x: "month", y: "hour", value: "no2" } });
  });

  it("is, after one row an hour and a season, a line a season", () => {
    const offered = after(table([hour, season, { name: "no2", kind: "number", unit: "µg/m³" }]));
    expect(offer(offered, "Lines of no2 along hour, a line a season")).toMatchObject({ kind: "lines", values: { x: "hour", y: "no2", split: "season" } });
  });

  it("is a join with another table on the canvas that shares a key, and how two measures go together", () => {
    const heat = table([year, month, { name: "tx", kind: "number", unit: "°C" }, { name: "rain", kind: "number", unit: "mm" }]);
    const offered = after(heat, { air: table([year, month, { name: "no2", kind: "number", unit: "µg/m³" }]), names: table([{ name: "station", kind: "text", key: true }]) });
    expect(offer(offered, "Join with The air")).toEqual({ label: "Join with The air", kind: "join", from: "table", into: "left", values: {}, also: { from: { node: "air", pin: "table" }, into: "right" } });
    expect(labels(offered)).not.toContain("Join with The names");
    expect(offer(offered, "Correlation of tx and rain")).toMatchObject({ kind: "correlation", values: { x: "rain", y: "tx" } });
  });

  it("joins only tables whose keys hold, or are held by, its own, at most two, those that share most first", () => {
    const monthly = table([year, month, { name: "tx", kind: "number", unit: "°C" }]);
    const offered = after(monthly, { yearly: table([year, { name: "days", kind: "number" }]), same: table([year, month, { name: "no2", kind: "number", unit: "µg/m³" }]), hours: table([month, hour, { name: "no2", kind: "number" }]), more: table([year, { name: "x", kind: "number" }]) });
    expect(labels(offered).filter((label) => label.startsWith("Join"))).toEqual(["Join with The same", "Join with The yearly"]);
    expect(labels(offered)[0]).toBe("Join with The same");
  });

  it("never offers to join what is wired to it already, however far along the wires", () => {
    const monthly = table([year, month, { name: "tx", kind: "number", unit: "°C" }]);
    const blueprint: Blueprint = {
      nodes: [placed("a"), placed("b", "keep"), placed("c", "season")],
      wires: [
        { from: { node: "a", pin: "table" }, to: { node: "b", pin: "table" } },
        { from: { node: "b", pin: "table" }, to: { node: "c", pin: "table" } },
      ],
    };
    const evaluation: Evaluation = new Map(["a", "b", "c"].map((id) => [id, done({ table: monthly })]));
    expect(labels(suggestionsFor(blueprint, "a", aKit, evaluation)).filter((label) => label.startsWith("Join"))).toEqual([]);
  });

  it("offers no heat map where three keys would stack in each of its cells", () => {
    expect(labels(after(table([year, month, hour, { name: "no2", kind: "number", unit: "µg/m³" }]))).some((label) => label.startsWith("Heat map"))).toBe(false);
  });

  it("offers first, after a table made of two sources, how a measure of one goes with a measure of the other", () => {
    const both: Table = { ...table([year, month, { name: "tx", kind: "number", unit: "°C" }, { name: "rain", kind: "number", unit: "mm" }, { name: "no2", kind: "number", unit: "µg/m³" }]), credits: [{ said: "Meteocat." }, { said: "XVPCA." }] };
    const offered = after(both);
    expect(labels(offered).slice(0, 3)).toEqual(["Correlation of tx and no2", "Scatter: tx against no2", "Take the season out"]);
  });

  it("is, after the season taken out, the years taken out too, and never the season again", () => {
    const blueprint: Blueprint = { nodes: [{ ...placed("s", "season"), values: { by: "month" } }], wires: [] };
    const offered = suggestionsFor(blueprint, "s", aKit, new Map([["s", done({ table: table([year, month, { name: "tn", kind: "number", unit: "°C" }]) })]]));
    expect(offer(offered, "Take the years out too")).toMatchObject({ kind: "season", values: { by: "year" } });
    expect(labels(offered)).not.toContain("Take the season out");
  });

  it("is, after a number, the number on the board", () => {
    const blueprint: Blueprint = { nodes: [placed("t", "trend")], wires: [] };
    const offered = suggestionsFor(blueprint, "t", aKit, new Map([["t", done({ "per-ten": 2, slope: 0.2, change: 4 })]]));
    expect(offered[0]).toEqual({ label: "On the board: for each ten", kind: "readout", from: "per-ten", into: "value", values: {} });
  });

  it("is, after what only some kinds take, those kinds, the pictures first", () => {
    const thing = { name: "thing", label: "a thing", colour: "--x", describe: () => "a thing" };
    const maker: NodeKind = { name: "maker", title: "Maker", role: "source", shelf: "Things", summary: "", inputs: [], outputs: [{ name: "made", label: "made", type: "thing" }], run: () => ({}) };
    const drawer: NodeKind = { name: "drawer", title: "Draw a thing", role: "paint", shelf: "Things", summary: "", inputs: [{ name: "it", label: "it", type: "thing" }], outputs: [], run: () => ({}) };
    const changer: NodeKind = { ...drawer, name: "changer", title: "Change a thing", role: "step", outputs: [{ name: "made", label: "made", type: "thing" }] };
    const kit = kitOf([...coreNodes, maker, changer, drawer], [...coreTypes, thing]);
    const offered = suggestionsFor({ nodes: [placed("m", "maker")], wires: [] }, "m", kit, new Map([["m", done({ made: {} })]]));
    expect(offered).toEqual([
      { label: "Draw a thing", kind: "drawer", from: "made", into: "it", values: {} },
      { label: "Change a thing", kind: "changer", from: "made", into: "it", values: {} },
    ]);
  });

  it("is nothing for a node that has not run", () => {
    expect(suggestionsFor({ nodes: [placed("a")], wires: [] }, "a", aKit, new Map())).toEqual([]);
  });
});

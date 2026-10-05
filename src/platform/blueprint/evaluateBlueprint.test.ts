import { describe, expect, it } from "vitest";
import type { Blueprint, PlacedNode, Wire } from "./Blueprint";
import { coreTypes } from "./coreTypes";
import { evaluateBlueprint } from "./evaluateBlueprint";
import type { NodeResult } from "./Evaluation";
import { kitOf } from "./kitOf";
import type { NodeKind } from "./NodeKind";
import { Pending } from "./Pending";
import type { PinType } from "./PinType";
import type { Table } from "./Table";

const runs: string[] = [];

const numbers: NodeKind = {
  name: "numbers",
  title: "Numbers",
  role: "source",
  shelf: "Test",
  summary: "a table of the numbers up to a count",
  inputs: [{ name: "count", label: "count", type: "number", initial: 3 }],
  outputs: [{ name: "table", label: "table", type: "table" }],
  run: ({ count }) => {
    runs.push("numbers");
    const rows = Array.from({ length: Number(count) }, (_, at) => ({ n: at + 1 }));
    return { outputs: { table: { columns: [{ name: "n", kind: "number" }], rows } satisfies Table } };
  },
};

const total: NodeKind = {
  name: "total",
  title: "Total",
  role: "statistic",
  shelf: "Test",
  summary: "adds a column up",
  inputs: [
    { name: "table", label: "table", type: "table" },
    { name: "times", label: "times", type: "number", optional: true },
  ],
  outputs: [{ name: "sum", label: "sum", type: "number" }],
  run: ({ table, times }) => {
    runs.push("total");
    const sum = (table as Table).rows.reduce((all, row) => all + Number(row["n"]), 0) * (times === undefined ? 1 : Number(times));
    return { outputs: { sum }, settled: { times: times === undefined ? 1 : Number(times) } };
  },
};

const fragile: NodeKind = {
  name: "fragile",
  title: "Fragile",
  role: "step",
  shelf: "Test",
  summary: "refuses an odd sum",
  inputs: [{ name: "value", label: "value", type: "number" }],
  outputs: [{ name: "value", label: "value", type: "number" }],
  run: ({ value }) => {
    if (Number(value) % 2 === 1) throw new Error("an odd sum cannot be halved");
    return { outputs: { value: Number(value) / 2 } };
  },
};

const fetched: NodeKind = {
  name: "fetched",
  title: "Fetched",
  role: "source",
  shelf: "Test",
  summary: "a number kept in a file",
  inputs: [],
  outputs: [{ name: "value", label: "value", type: "number" }],
  run: (_inputs, { read }) => ({ outputs: { value: Number(read("/data/seven.txt")) } }),
};

const painter: NodeKind = {
  name: "painter",
  title: "Painter",
  role: "paint",
  shelf: "Test",
  summary: "paints a number",
  inputs: [{ name: "value", label: "value", type: "number" }],
  outputs: [],
  run: ({ value }) => ({ painting: { html: `<b>${String(value)}</b>`, caption: "a number in bold" } }),
};

/** A type of a feature's own, which can also go where a table goes. */
const pair: PinType = { name: "pair", label: "a pair", colour: "--bp-pair", describe: () => "a pair", becomes: { table: (value) => ({ columns: [{ name: "n", kind: "number" }], rows: (value as number[]).map((n) => ({ n })) }) } };
const pairs: NodeKind = { name: "pairs", title: "Pairs", role: "source", shelf: "Test", summary: "", inputs: [], outputs: [{ name: "pair", label: "pair", type: "pair" }], run: () => ({ outputs: { pair: [10, 20] } }) };
const dial: NodeKind = { name: "dial", title: "Dial", role: "dial", shelf: "Dials", summary: "", inputs: [{ name: "value", label: "value", type: "value" }], outputs: [{ name: "value", label: "value", type: "value" }], run: ({ value }) => ({ outputs: { value } }) };

const kit = kitOf([numbers, total, fragile, fetched, painter, pairs, dial], [...coreTypes, pair]);
const node = (id: string, kind: string, values: PlacedNode["values"] = {}): PlacedNode => ({ id, kind, x: 0, y: 0, values });
const wire = (from: string, out: string, to: string, into: string): Wire => ({ from: { node: from, pin: out }, to: { node: to, pin: into } });
const files = (held: Record<string, string>) => ({
  read: (path: string) => {
    const text = held[path];
    if (text === undefined) throw new Pending(path);
    return text;
  },
});
const done = (result: NodeResult | undefined) => (result?.state === "done" ? result : null);

describe("a blueprint, run", () => {
  it("runs each node after the ones its wires come from, handing each what the other gave", () => {
    const blueprint: Blueprint = { nodes: [node("sum", "total"), node("ns", "numbers", { count: 4 })], wires: [wire("ns", "table", "sum", "table")] };
    const results = evaluateBlueprint(blueprint, kit, files({}));
    expect(done(results.get("sum"))?.outputs["sum"]).toBe(10);
    expect(done(results.get("ns"))?.said).toBe("4 rows · n");
  });

  it("takes what is written on a node, or else what the input starts with, and leaves an optional one to the node", () => {
    const blueprint: Blueprint = { nodes: [node("ns", "numbers"), node("sum", "total")], wires: [wire("ns", "table", "sum", "table")] };
    const result = done(evaluateBlueprint(blueprint, kit, files({})).get("sum"));
    expect(result?.outputs["sum"]).toBe(6);
    expect(result?.settled).toEqual({ times: 1 });
  });

  it("says which inputs a node still needs, rather than running it without them", () => {
    const results = evaluateBlueprint({ nodes: [node("sum", "total")], wires: [] }, kit, files({}));
    expect(results.get("sum")).toEqual({ state: "missing", pins: ["table"] });
  });

  it("says when a blueprint names a kind there is none of", () => {
    expect(evaluateBlueprint({ nodes: [node("x", "teleport")], wires: [] }, kit, files({})).get("x")).toEqual({ state: "unknown" });
  });

  it("says in words why a node failed, and holds back the ones that needed it", () => {
    const blueprint: Blueprint = {
      nodes: [node("ns", "numbers", { count: 2 }), node("sum", "total"), node("half", "fragile"), node("shown", "painter")],
      wires: [wire("ns", "table", "sum", "table"), wire("sum", "sum", "half", "value"), wire("half", "value", "shown", "value")],
    };
    const results = evaluateBlueprint(blueprint, kit, files({}));
    expect(results.get("half")).toMatchObject({ state: "failed", message: "an odd sum cannot be halved" });
    expect(results.get("shown")).toEqual({ state: "blocked", by: "half" });
  });

  it("waits for a file on its way, and runs once it is there", () => {
    const blueprint: Blueprint = { nodes: [node("seven", "fetched"), node("shown", "painter")], wires: [wire("seven", "value", "shown", "value")] };
    const waiting = evaluateBlueprint(blueprint, kit, files({}));
    expect(waiting.get("seven")).toEqual({ state: "waiting", path: "/data/seven.txt" });
    expect(waiting.get("shown")).toEqual({ state: "blocked", by: "seven" });
    const arrived = evaluateBlueprint(blueprint, kit, files({ "/data/seven.txt": "7" }), waiting);
    expect(done(arrived.get("shown"))?.painting).toEqual({ html: "<b>7</b>", caption: "a number in bold" });
  });

  it("runs again only the nodes whose inputs changed, and what follows them", () => {
    const blueprint: Blueprint = {
      nodes: [node("ns", "numbers", { count: 3 }), node("sum", "total"), node("other", "numbers", { count: 1 })],
      wires: [wire("ns", "table", "sum", "table")],
    };
    const first = evaluateBlueprint(blueprint, kit, files({}));
    runs.length = 0;
    const same = evaluateBlueprint(blueprint, kit, files({}), first);
    expect(runs).toEqual([]);
    expect(same.get("sum")).toBe(first.get("sum"));
    const moved = { ...blueprint, nodes: blueprint.nodes.map((each) => (each.id === "ns" ? { ...each, values: { count: 5 } } : each)) };
    evaluateBlueprint(moved, kit, files({}), same);
    expect(runs).toEqual(["numbers", "total"]);
  });

  it("makes what flows into what an input takes, where its type says it can become that", () => {
    const blueprint: Blueprint = { nodes: [node("p", "pairs"), node("sum", "total"), node("k", "dial", { value: "2" })], wires: [wire("p", "pair", "sum", "table"), wire("k", "value", "sum", "times")] };
    expect(done(evaluateBlueprint(blueprint, kit, files({})).get("sum"))?.outputs["sum"]).toBe(60);
  });

  it("refuses a wire between types that cannot meet, in words", () => {
    const blueprint: Blueprint = { nodes: [node("ns", "numbers"), node("half", "fragile")], wires: [wire("ns", "table", "half", "value")] };
    expect(evaluateBlueprint(blueprint, kit, files({})).get("half")).toMatchObject({ state: "failed", message: "a table cannot go into value, which takes a number" });
  });

  it("refuses nodes that wait on each other round in a circle", () => {
    const blueprint: Blueprint = { nodes: [node("a", "fragile"), node("b", "fragile")], wires: [wire("a", "value", "b", "value"), wire("b", "value", "a", "value")] };
    expect(evaluateBlueprint(blueprint, kit, files({})).get("a")).toMatchObject({ state: "failed", message: "it waits on itself, round a circle of wires" });
  });
});

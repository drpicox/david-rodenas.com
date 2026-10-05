import { describe, expect, it } from "vitest";
import type { NodeKind } from "../blueprint/NodeKind";
import type { PinType } from "../blueprint/PinType";
import { blueprintKitOf } from "./blueprintKitOf";

const stations: NodeKind = { name: "stations", title: "Stations", role: "source", shelf: "Weather", summary: "the stations", inputs: [], outputs: [{ name: "graph", label: "graph", type: "graph" }], run: () => ({}) };
const graph: PinType = { name: "graph", label: "a graph", colour: "--bp-graph", describe: () => "a graph" };

describe("everything a blueprint on this site can name", () => {
  it("is the nodes every blueprint has, and the ones each feature brings, with the wires of its own", () => {
    const kit = blueprintKitOf([{ name: "weather", nodes: [stations], pinTypes: [graph] }, { name: "theme" }]);
    expect(kit.kinds.has("stations")).toBe(true);
    expect(kit.kinds.has("scatter")).toBe(true);
    expect(kit.types.get("graph")?.label).toBe("a graph");
  });

  it("refuses two features bringing a node by one name", () => {
    expect(() => blueprintKitOf([{ name: "a", nodes: [stations] }, { name: "b", nodes: [stations] }])).toThrow("two kinds of node are called stations");
  });
});

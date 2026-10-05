import { describe, expect, it } from "vitest";
import { aKit } from "../blueprint/aKit";
import type { Blueprint } from "../blueprint/Blueprint";
import { NODE } from "../blueprint/NODE";
import { nodeShapeOf } from "../blueprint/nodeShapeOf";
import { boundsOf } from "./boundsOf";
import { kindsFor } from "./kindsFor";
import { linkCodeOf } from "./linkCodeOf";
import { pinAt } from "./pinAt";
import { textOfLinkCode } from "./textOfLinkCode";

describe("the kinds of node the menu offers", () => {
  it("are those with every word typed, titles beginning with them first", () => {
    const names = (query: string) => kindsFor(aKit, query).map((offer) => offer.kind.name);
    expect(names("scat")).toEqual(["scatter"]);
    expect(names("line")[0]).toBe("lines");
    expect(names("the season")).toEqual(["season"]);
  });

  it("are, for a wire being dragged out of an output, only those it could go into, with the pin it would", () => {
    const offers = kindsFor(aKit, "", { type: "table", side: "output" });
    expect(offers.find((offer) => offer.kind.name === "join")?.pin).toBe("left");
    expect(offers.some((offer) => offer.kind.name === "readout")).toBe(false);
    expect(offers.some((offer) => offer.kind.name === "nights")).toBe(false);
    expect(kindsFor(aKit, "", { type: "number", side: "output" }).some((offer) => offer.kind.name === "dial")).toBe(false);
  });

  it("are, for a wire being dragged out of an input, only those whose output could feed it", () => {
    const offers = kindsFor(aKit, "", { type: "number", side: "input" });
    expect(offers.map((offer) => [offer.kind.name, offer.pin])).toContainEqual(["dial", "value"]);
    expect(offers.map((offer) => [offer.kind.name, offer.pin])).toContainEqual(["correlation", "r"]);
    expect(offers.some((offer) => offer.kind.name === "keep")).toBe(false);
  });
});

describe("the pin under a point", () => {
  const blueprint: Blueprint = { nodes: [{ id: "n", kind: "nights", x: 100, y: 100, values: {} }], wires: [] };
  const shape = nodeShapeOf(aKit.kinds.get("nights"));

  it("is the nearest within reach, input or output", () => {
    const out = shape.outputs.get("table")!;
    expect(pinAt(blueprint, aKit, { x: 100 + out.x + 5, y: 100 + out.y - 3 })).toEqual({ node: "n", pin: "table", side: "output" });
    const input = shape.inputs.get("place")!;
    expect(pinAt(blueprint, aKit, { x: 100 + input.x, y: 100 + input.y })).toEqual({ node: "n", pin: "place", side: "input" });
  });

  it("is none, out of reach", () => {
    expect(pinAt(blueprint, aKit, { x: 100 + NODE.width / 2, y: 100 + 60 })).toBeNull();
  });
});

describe("the rectangle a blueprint stands in", () => {
  it("holds every node, and is none for a blueprint with no nodes", () => {
    const blueprint: Blueprint = { nodes: [{ id: "a", kind: "nights", x: 10, y: 20, values: {} }, { id: "b", kind: "nights", x: 300, y: -40, values: {} }], wires: [] };
    expect(boundsOf(blueprint, aKit)).toEqual({ x: 10, y: -40, width: 290 + NODE.width, height: 60 + nodeShapeOf(aKit.kinds.get("nights")).height });
    expect(boundsOf({ nodes: [], wires: [] }, aKit)).toBeNull();
  });
});

describe("a blueprint in a link", () => {
  it("comes back out as it went in, whatever letters it has, in letters a URL keeps as they are", () => {
    const text = 'heat = weather-months "Calor à l\'Observatori" station: D5\nbars table: heat → µg/m³';
    const code = linkCodeOf(text);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(textOfLinkCode(code)).toBe(text);
  });

  it("is nothing when the link carries something else", () => {
    expect(textOfLinkCode("%%%")).toBeNull();
    expect(textOfLinkCode("_w")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { aKit } from "../../platform/blueprint/aKit";
import { evaluateBlueprint } from "../../platform/blueprint/evaluateBlueprint";
import { parseBlueprint } from "../../platform/blueprint/parseBlueprint";
import { codeOf } from "./codeOf";

const codes = (text: string) => {
  const { blueprint } = parseBlueprint(text, aKit);
  const evaluation = evaluateBlueprint(blueprint, aKit, { read: () => "" });
  return Object.fromEntries(blueprint.nodes.map((node) => [node.id, codeOf(node, aKit, evaluation.get(node.id))]));
};

describe("the figure a module's pad carries, which on this display is a real one", () => {
  it("is how many rows a module gave, or the number it found", () => {
    expect(codes("n = nights\nt = trend table: n y: nights\nr = correlation table: n x: year y: nights")).toEqual({ n: "5", t: "20", r: "1" });
  });

  it("is the first figure of what a module says it drew, where it gives nothing on", () => {
    expect(codes("n = nights\nbars table: n").bars).toBe("5");
  });

  it("is what a dial is set to, where that is short enough to carry", () => {
    expect(codes("place = dial value: X4\nfrom = dial value: 2010\nlong = dial value: torrid-nights\nn = nights place: place from: from")).toMatchObject({ place: "X4", from: "2010", long: "DIAL" });
  });

  it("is what the module is for, where there is nothing to count", () => {
    expect(codes('note text: "Only words."').note).toBe("NOTE");
  });

  it("says a module is waiting, lacks something, or failed, where it has no figure yet", () => {
    const [node] = parseBlueprint("n = nights", aKit).blueprint.nodes;
    expect(codeOf(node!, aKit, undefined)).toBe("···");
    expect(codeOf(node!, aKit, { state: "waiting", path: "/data/x.json" })).toBe("···");
    expect(codeOf(node!, aKit, { state: "blocked", by: "m" })).toBe("···");
    expect(codeOf(node!, aKit, { state: "missing", pins: ["table"] })).toBe("---");
    expect(codeOf(node!, aKit, { state: "failed", inputs: {}, message: "no", key: [] })).toBe("ERR");
    expect(codeOf({ ...node!, kind: "nothing" }, aKit, { state: "unknown" })).toBe("???");
  });
});

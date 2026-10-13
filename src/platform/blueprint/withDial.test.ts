import { describe, expect, it } from "vitest";
import { aKit } from "./aKit";
import { parseBlueprint } from "./parseBlueprint";
import { withDial } from "./withDial";

const { blueprint } = parseBlueprint("n = nights from: 2010\nbars table: n", aKit);

describe("an input put on the board", () => {
  it("gets a dial of its own, called as the input is, standing where asked and wired into it, holding what was written there", () => {
    const made = withDial(blueprint, aKit, "n", "from", undefined, { x: 12, y: 34 });
    expect(made?.dial).toBe("from");
    expect(made?.blueprint.nodes.at(-1)).toEqual({ id: "from", kind: "dial", x: 12, y: 34, title: "from", values: { value: 2010 } });
    expect(made?.blueprint.wires.at(-1)).toEqual({ from: { node: "from", pin: "value" }, to: { node: "n", pin: "from" } });
    expect(made?.blueprint.nodes.find((node) => node.id === "n")?.values).toEqual({});
  });

  it("holds what the node chose for the input, or what its kind starts it with, where nothing was written", () => {
    expect(withDial(blueprint, aKit, "bars", "x", "year", { x: 0, y: 0 })?.blueprint.nodes.at(-1)?.values).toEqual({ value: "year" });
    expect(withDial(blueprint, aKit, "n", "place", undefined, { x: 0, y: 0 })?.blueprint.nodes.at(-1)?.values).toEqual({ value: "WU" });
  });

  it("is nothing for an input that is not there", () => {
    expect(withDial(blueprint, aKit, "n", "nothing", undefined, { x: 0, y: 0 })).toBeNull();
    expect(withDial(blueprint, aKit, "nobody", "from", undefined, { x: 0, y: 0 })).toBeNull();
  });
});

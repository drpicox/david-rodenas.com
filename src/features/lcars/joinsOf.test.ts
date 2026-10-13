import { describe, expect, it } from "vitest";
import { aKit } from "../../platform/blueprint/aKit";
import type { Wire } from "../../platform/blueprint/Blueprint";
import { kitOf } from "../../platform/blueprint/kitOf";
import type { NodeKind } from "../../platform/blueprint/NodeKind";
import { parseBlueprint } from "../../platform/blueprint/parseBlueprint";
import { joinsOf } from "./joinsOf";

const of = (text: string) => parseBlueprint(text, aKit).blueprint;
const said = (wires: readonly Wire[]) => wires.map((wire) => `${wire.from.node}.${wire.from.pin} > ${wire.to.node}.${wire.to.pin}`);

describe("the conduits that could be run from one module into another", () => {
  it("is the one there is, where one output fits one input: run without asking", () => {
    const joins = joinsOf(of("n = nights\nbars"), aKit, { node: "n" }, { node: "bars" });
    expect(said(joins.wires)).toEqual(["n.table > bars.table"]);
    expect(joins.plain).toEqual(joins.wires[0]);
    expect(joins.refused).toBeNull();
  });

  it("is every input the output fits, where the module has several: which of them is to be asked", () => {
    const joins = joinsOf(of("a = nights\njoin"), aKit, { node: "a" }, { node: "join" });
    expect(said(joins.wires)).toEqual(["a.table > join.left", "a.table > join.right"]);
    expect(joins.plain).toBeNull();
  });

  it("is run without asking into the one input nothing feeds yet, though it could take the place of what feeds another", () => {
    const joins = joinsOf(of("a = nights\nb = nights\njoin left: a"), aKit, { node: "b" }, { node: "join" });
    expect(said(joins.wires)).toEqual(["b.table > join.left", "b.table > join.right"]);
    expect(said(joins.plain ? [joins.plain] : [])).toEqual(["b.table > join.right"]);
  });

  it("is only into the input said, where the hand is on one, even one that is fed already", () => {
    const joins = joinsOf(of("a = nights\nb = nights\njoin left: a"), aKit, { node: "b" }, { node: "join", pin: "left" });
    expect(said(joins.wires)).toEqual(["b.table > join.left"]);
    expect(joins.plain).toEqual(joins.wires[0]);
  });

  it("is every output that fits, where the module gives several and the hand did not say which", () => {
    const joins = joinsOf(of("n = nights\nt = trend table: n\nreadout"), aKit, { node: "t" }, { node: "readout" });
    expect(said(joins.wires)).toEqual(["t.per-ten > readout.value", "t.slope > readout.value", "t.change > readout.value"]);
    expect(joins.plain).toBeNull();
    expect(said(joinsOf(of("n = nights\nt = trend table: n\nreadout"), aKit, { node: "t", pin: "slope" }, { node: "readout" }).wires)).toEqual(["t.slope > readout.value"]);
  });

  it("is none where nothing fits, and says why in the words a wire is refused in", () => {
    const refused = (text: string, from: string, to: string) => joinsOf(of(text), aKit, { node: from }, { node: to });
    expect(refused("n = nights\nreadout", "n", "readout")).toEqual({ wires: [], plain: null, refused: "a table cannot go into value, which takes a number" });
    expect(refused("n = nights\nk = keep table: n", "k", "k").refused).toBe("a node cannot feed itself");
    expect(refused("n = nights\nk = keep table: n\ns = sort table: k", "s", "k").refused).toBe("that would make a circle: s needs k already");
    expect(refused("n = nights\nd = dial", "n", "d").refused).toBe("a dial is turned by hand, and takes no wire");
  });

  it("says a module that gives nothing gives nothing, that one that takes nothing takes nothing, and that a kind there is not is not there", () => {
    const bare: NodeKind = { name: "bare", title: "Bare", role: "source", shelf: "Test", summary: "", inputs: [], outputs: [{ name: "table", label: "table", type: "table" }], run: () => ({ outputs: {} }) };
    const kit = kitOf([...aKit.kinds.values(), bare], [...aKit.types.values()]);
    expect(joinsOf(of("n = nights\nnote"), aKit, { node: "note" }, { node: "n" }).refused).toBe("Note gives nothing to run a conduit from");
    expect(joinsOf(parseBlueprint("n = nights\nbare", kit).blueprint, kit, { node: "n" }, { node: "bare" }).refused).toBe("Bare takes nothing");
    expect(joinsOf(of("n = nights\nwhat"), aKit, { node: "n" }, { node: "what" }).refused).toBe("there is no kind of node called what");
  });

  it("leaves out the conduit that is there already, and says so when it was the only one", () => {
    expect(joinsOf(of("n = nights\nbars table: n"), aKit, { node: "n" }, { node: "bars" })).toEqual({ wires: [], plain: null, refused: "it feeds it there already" });
    const joins = joinsOf(of("a = nights\njoin left: a"), aKit, { node: "a" }, { node: "join" });
    expect(said(joins.wires)).toEqual(["a.table > join.right"]);
  });
});

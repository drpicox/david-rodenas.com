import { describe, expect, it } from "vitest";
import { coreNodes } from "./coreNodes";
import { coreTypes } from "./coreTypes";
import { kitOf } from "./kitOf";
import { dialNode } from "./nodes/dialNode";
import { noteNode } from "./nodes/noteNode";

describe("the nodes every blueprint has", () => {
  it("are all found by name, none two by one", () => {
    expect(() => kitOf(coreNodes, coreTypes)).not.toThrow();
  });

  it("each take and give only what flows along the wires there are", () => {
    const types = new Set(coreTypes.map((type) => type.name));
    const strange = coreNodes.flatMap((kind) => [...kind.inputs, ...kind.outputs].filter((pin) => !types.has(pin.type)).map((pin) => `${kind.name}.${pin.name}: ${pin.type}`));
    expect(strange).toEqual([]);
  });

  it("each say in a line what they do, for the menu", () => {
    expect(coreNodes.filter((kind) => kind.summary.length < 20).map((kind) => kind.name)).toEqual([]);
  });

  it("pick a column only of an input of their own that takes a table", () => {
    const astray = coreNodes.flatMap((kind) =>
      kind.inputs.flatMap((pin) => (typeof pin.editor === "object" && pin.editor.kind === "column" && kind.inputs.find((other) => other.name === (pin.editor as { of: string }).of)?.type !== "table" ? [`${kind.name}.${pin.name}`] : [])),
    );
    expect(astray).toEqual([]);
  });
});

describe("a dial, and a note", () => {
  it("a dial gives whatever it holds", () => {
    expect(dialNode.run({ value: 25 }, { read: () => "" }).outputs).toEqual({ value: 25 });
  });

  it("a note gives nothing, and says nothing", () => {
    expect(noteNode.run({ text: "try another station" }, { read: () => "" })).toEqual({ said: "" });
  });
});

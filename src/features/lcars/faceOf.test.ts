import { describe, expect, it } from "vitest";
import { aKit } from "../../platform/blueprint/aKit";
import { evaluateBlueprint } from "../../platform/blueprint/evaluateBlueprint";
import { parseBlueprint } from "../../platform/blueprint/parseBlueprint";
import { faceOf } from "./faceOf";

const read = () => "";
const TEXT = [
  'place = dial "Station" value: X4',
  "n = nights place: place from: 2010",
  'some = keep "Only some" table: n column: year is: at-least value: 2012',
  "both = join left: n right: some",
  "bars table: some",
  "t = trend table: some",
  "readout value: t unit: nights",
  "c = correlation table: n",
].join("\n");

const faces = (text = TEXT, run = true) => {
  const { blueprint } = parseBlueprint(text, aKit);
  const evaluation = run ? evaluateBlueprint(blueprint, aKit, { read }) : new Map();
  return Object.fromEntries(blueprint.nodes.map((node) => [node.id, faceOf(node, blueprint, aKit, evaluation, read)]));
};

describe("the face a module shows on the schematic: what comes into it, what it is told, and what leaves it", () => {
  const face = faces();

  it("has a port for every wired input, called as the input is, in the order its kind has them", () => {
    expect(face["both"]?.ins.map((port) => [port.pin, port.said])).toEqual([["left", "left"], ["right", "right"]]);
    expect(face["some"]?.ins.map((port) => port.pin)).toEqual(["table"]);
    expect(face["place"]?.ins).toEqual([]);
  });

  it("gives a port the colour of what arrives there, which is the colour of its conduit: a dial's value into words is still a dial's value", () => {
    expect(face["n"]?.ins).toEqual([{ pin: "place", said: "place", colour: "--bp-value" }]);
    expect(face["some"]?.ins[0]?.colour).toBe("--bp-table");
  });

  it("has one port out for a kind that gives one thing, carrying its figure: the rows it gave, what a dial is set to", () => {
    expect(face["n"]?.outs).toEqual([{ pin: "table", said: "5", colour: "--bp-table", figure: true }]);
    expect(face["some"]?.outs[0]?.said).toBe("3");
    expect(face["place"]?.outs).toEqual([{ pin: "value", said: "X4", colour: "--bp-value", figure: true }]);
  });

  it("says which output each conduit leaves from, where a kind gives several; and carries the first one's figure while none is wired", () => {
    expect(face["t"]?.outs).toEqual([{ pin: "per-ten", said: "for each ten", colour: "--bp-number" }]);
    expect(face["c"]?.outs).toEqual([{ pin: "r", said: "1", colour: "--bp-number", figure: true }]);
  });

  it("has no port out for a kind that only paints", () => {
    expect(face["bars"]?.outs).toEqual([]);
  });

  it("says what is written on each input no wire brings, as a reader would say it", () => {
    expect(face["some"]?.rows).toEqual([
      { pin: "column", label: "column", value: "year", how: "written" },
      { pin: "is", label: "is", value: "is at least", how: "written" },
      { pin: "value", label: "value", value: "2012", how: "written" },
    ]);
    expect(face["n"]?.rows).toEqual([{ pin: "from", label: "from", value: "2010", how: "written" }]);
    expect(face["readout"]?.rows).toEqual([{ pin: "unit", label: "unit", value: "nights", how: "written" }]);
  });

  it("says what a module chose for itself where an input was left to it, and leaves out what merely starts as its kind says", () => {
    expect(face["bars"]?.rows).toEqual([
      { pin: "x", label: "x", value: "year", how: "settled" },
      { pin: "y", label: "height", value: "nights", how: "settled" },
    ]);
    expect(face["c"]?.rows.map((row) => row.label)).toEqual(["x", "y"]);
  });

  it("says what a module still lacks, and nothing of a dial, whose setting is its figure", () => {
    expect(faces("bars")["bars"]?.rows).toEqual([{ pin: "table", label: "table", value: "—", how: "missing" }]);
    expect(face["place"]?.rows).toEqual([]);
  });

  it("shows a module that has not run with its ports and what is written on it, and no figure yet", () => {
    const waiting = faces(TEXT, false);
    expect(waiting["n"]?.outs).toEqual([{ pin: "table", said: "···", colour: "--bp-table", figure: true }]);
    expect(waiting["n"]?.rows).toEqual([{ pin: "from", label: "from", value: "2010", how: "written" }]);
    expect(waiting["bars"]?.rows).toEqual([]);
  });

  it("still shows the wires of a node of no known kind", () => {
    const unknown = faces("n = nights\nx = nothing table: n\nbars table: x");
    expect(unknown["x"]).toEqual({ ins: [{ pin: "table", said: "table", colour: "--bp-table" }], outs: [{ pin: "value", said: "???", colour: "--dim", figure: true }], rows: [] });
  });
});

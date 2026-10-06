import { describe, expect, it } from "vitest";
import { aKit } from "./aKit";
import type { PlacedNode } from "./Blueprint";
import { evaluateBlueprint } from "./evaluateBlueprint";
import { resolvedEditor } from "./resolvedEditor";
import { saidBy } from "./saidBy";

const read = () => "";
const nights: PlacedNode = { id: "n", kind: "nights", x: 0, y: 0, values: {} };
const bars: PlacedNode = { id: "b", kind: "bars", x: 0, y: 0, values: { y: "rain" } };
const pinOf = (kind: string, name: string) => aKit.kinds.get(kind)!.inputs.find((pin) => pin.name === name)!;

describe("how an input is written by hand", () => {
  it("is as its kind says: a range, or a choice", () => {
    expect(resolvedEditor(nights, pinOf("nights", "from"), aKit, read)).toEqual({ kind: "number", min: 1990, max: 2030, step: 1 });
    expect(resolvedEditor(nights, pinOf("nights", "place"), aKit, read).kind).toBe("choice");
  });

  it("is a choice among the columns of the table the node was handed, keeping what is written there even when it is not one of them", () => {
    const blueprint = { nodes: [nights, bars], wires: [{ from: { node: "n", pin: "table" }, to: { node: "b", pin: "table" } }] };
    const evaluation = evaluateBlueprint(blueprint, aKit, { read });
    expect(resolvedEditor(bars, pinOf("bars", "y"), aKit, read, evaluation)).toEqual({ kind: "choice", choices: [{ value: "year", label: "year" }, { value: "nights", label: "nights" }, { value: "rain", label: "rain" }] });
  });

  it("is, with nothing to say how, as its type takes", () => {
    expect(resolvedEditor(bars, pinOf("readout", "value"), aKit, read)).toEqual({ kind: "number" });
    expect(resolvedEditor(bars, pinOf("readout", "unit"), aKit, read)).toEqual({ kind: "text" });
  });

  it("is worked out from the data where its range depends on it, and as its type takes while the data is not there", () => {
    const pin = { name: "commit", label: "commit", type: "number", editor: (files: (path: string) => string) => ({ kind: "number" as const, max: Number(files("/n")) }) };
    expect(resolvedEditor(nights, pin, aKit, () => "7")).toEqual({ kind: "number", max: 7 });
    expect(
      resolvedEditor(nights, pin, aKit, () => {
        throw new Error("not yet");
      }),
    ).toEqual({ kind: "number" });
  });
});

describe("the value a filter asks for", () => {
  const seasons = { id: "s", kind: "your-data", x: 0, y: 0, values: { text: "season, month\nwinter, 1\nsummer, 7\nsummer, 8\n, 9" } };
  const keepWith = (values: PlacedNode["values"]): PlacedNode => ({ id: "k", kind: "keep", x: 0, y: 0, values });
  const filtered = (values: PlacedNode["values"]) => {
    const keep = keepWith(values);
    const evaluation = evaluateBlueprint({ nodes: [seasons, keep], wires: [{ from: { node: "s", pin: "table" }, to: { node: "k", pin: "table" } }] }, aKit, { read });
    return resolvedEditor(keep, pinOf("keep", "value"), aKit, read, evaluation);
  };

  it("is one of the column's own values, where one is asked for", () => {
    expect(filtered({ column: "season", is: "equals" })).toEqual({ kind: "choice", choices: [{ value: "summer", label: "summer" }, { value: "winter", label: "winter" }] });
  });

  it("is a number in the column's range, where numbers are compared", () => {
    expect(filtered({ column: "month", is: "at-least" })).toEqual({ kind: "number", min: 1, max: 9, step: 1 });
  });

  it("is words where more than one value is asked for, or the column is not known yet", () => {
    expect(filtered({ column: "month", is: "between" })).toEqual({ kind: "text" });
    expect(resolvedEditor(keepWith({ column: "season" }), pinOf("keep", "value"), aKit, read)).toEqual({ kind: "text" });
  });
});

describe("a value, as the editor that sets it says it", () => {
  it("names a choice, shows a number, and says yes or no", () => {
    expect(saidBy({ kind: "choice", choices: [{ value: "WU", label: "Badalona" }] }, "WU")).toBe("Badalona");
    expect(saidBy({ kind: "number", show: (value) => `day ${value}` }, 3)).toBe("day 3");
    expect(saidBy({ kind: "number" }, 0.4213)).toBe("0.421");
    expect(saidBy({ kind: "flag" }, true)).toBe("yes");
  });
});

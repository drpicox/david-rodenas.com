import { describe, expect, it } from "vitest";
import { aKit } from "./aKit";
import type { Blueprint } from "./Blueprint";
import { dialsOf } from "./dialsOf";
import { parseBlueprint } from "./parseBlueprint";

describe("the dials on a blueprint's board", () => {
  const { blueprint } = parseBlueprint(['where = dial "Where" value: X4 @ 0 200', "since = dial value: 2010 @ 0 0", "nights from: since place: where @ 300 0", "free = dial value: hello @ 0 400"].join("\n"), aKit);

  it("stand in the order they stand on the canvas, top to bottom", () => {
    expect(dialsOf(blueprint, aKit, () => "").map((dial) => dial.node)).toEqual(["since", "where", "free"]);
  });

  it("are turned the way the input they are wired into is written, and say their value as it does", () => {
    const [since, where] = dialsOf(blueprint, aKit, () => "");
    expect(since).toMatchObject({ label: "from", value: 2010, editor: { kind: "number", min: 1990, max: 2030 }, said: "2010", targets: [{ node: "nights", pin: "from" }] });
    expect(where).toMatchObject({ label: "Where", value: "X4", said: "el Raval" });
  });

  it("are words when wired into nothing", () => {
    expect(dialsOf(blueprint, aKit, () => "")[2]).toMatchObject({ label: "dial", editor: { kind: "text" }, said: "hello" });
  });

  it("are none, on a blueprint without one", () => {
    const empty: Blueprint = { nodes: [], wires: [] };
    expect(dialsOf(empty, aKit, () => "")).toEqual([]);
  });
});

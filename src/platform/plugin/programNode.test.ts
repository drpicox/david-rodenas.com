import { describe, expect, it } from "vitest";
import type { Table } from "../blueprint/Table";
import { aProgram } from "../program/aProgram";
import type { Program } from "../program/Program";
import { programNode } from "./programNode";

const read = () => "";

/** A program whose answer has a list in it, as a simulation month by month has. */
const months: Program = {
  name: "two-roads",
  summary: "two teams, month by month",
  parameters: [{ name: "interest", label: "Interest", description: "percent", min: 0, max: 100, step: 1, initial: 10 }],
  run: (values) => ({
    text: "the clean road wins",
    html: "<p>chart</p>",
    data: { cleanFeatures: 12, breakEven: { month: 7, found: true }, months: [{ month: 1, cleanCumulative: 1, label: "first" }, { month: 2, cleanCumulative: 2 + Number(values["interest"]), label: "second" }] },
  }),
};

describe("a program as a node of a blueprint", () => {
  const node = programNode(aProgram);

  it("takes each of its parameters as an input, written as its dial is", () => {
    expect(node.inputs.map((pin) => [pin.name, pin.type, pin.initial])).toEqual([
      ["sum", "number", 100],
      ["rate", "number", 10],
      ["years", "number", 2],
      ["paid", "text", "once a year"],
    ]);
    expect(node.inputs[0]?.editor).toMatchObject({ kind: "number", min: 1, max: 1_000_000, step: 0.1 });
    expect(node.inputs[3]?.editor).toEqual({ kind: "choice", choices: [{ value: "once a year", label: "once a year" }, { value: "every month", label: "every month" }] });
  });

  it("gives the figures of its answer, and paints its own picture of it, on the shelf of programs", () => {
    expect(node.outputs).toEqual([{ name: "grown", label: "grown", type: "number" }]);
    const ran = node.run({ sum: 100, rate: 10, years: 3, paid: "once a year" }, { read });
    expect(ran.outputs).toEqual({ grown: 133 });
    expect(ran.painting).toEqual({ html: "<p><strong>133</strong> €</p>", caption: "133 €" });
    expect([node.name, node.title, node.shelf, node.role]).toEqual(["savings", "Savings", "Programs", "paint"]);
  });

  it("gives a list in its answer as a table, and what is nested in it by a name that says where", () => {
    const roads = programNode(months);
    expect(roads.outputs.map((pin) => [pin.name, pin.type])).toEqual([
      ["clean-features", "number"],
      ["break-even-month", "number"],
      ["break-even-found", "flag"],
      ["months", "table"],
    ]);
    const table = roads.run({ interest: 5 }, { read }).outputs?.["months"] as Table;
    expect(table.columns).toEqual([{ name: "month", kind: "number" }, { name: "cleanCumulative", kind: "number" }, { name: "label", kind: "text" }]);
    expect(table.rows[1]).toEqual({ month: 2, cleanCumulative: 7, label: "second" });
  });

  it("gives no value for a figure that is none this time, rather than a zero", () => {
    const sometimes: Program = { ...months, run: () => ({ text: "", html: "", data: { breakEven: null } }) };
    const kind = programNode({ ...sometimes, run: (values) => (values["interest"] === 10 ? { text: "", html: "", data: { breakEven: 4 } } : sometimes.run(values)) });
    expect(kind.run({ interest: 50 }, { read }).outputs).toEqual({ "break-even": undefined });
  });

  it("refuses, in words, what its parameters do not take", () => {
    expect(() => node.run({ sum: 100, rate: 99, years: 3, paid: "once a year" }, { read })).toThrow("rate: 99 is outside 0 to 20");
  });
});

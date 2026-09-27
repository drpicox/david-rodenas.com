import { describe, expect, it } from "vitest";
import { boxCycles } from "./boxCycles";

const graph = (...pairs: [string, string][]) => ({
  modules: [],
  dependencies: pairs.map(([from, to]) => ({ from, to, typeOnly: false })),
});

describe("the boxes that need each other, round in a circle", () => {
  it("are none when every arrow between boxes can point one way", () => {
    expect(boxCycles(graph(["features/a/x.ts", "platform/p/y.ts"], ["platform/p/y.ts", "platform/q/z.ts"]))).toEqual([]);
  });

  it("are found however long the circle, and named by their boxes", () => {
    const circle = graph(["platform/p/a.ts", "platform/q/b.ts"], ["platform/q/b.ts", "platform/r/c.ts"], ["platform/r/c.ts", "platform/p/d.ts"]);
    expect(boxCycles(circle)).toEqual([["platform/p", "platform/q", "platform/r"]]);
  });

  it("count a type-only arrow as much as any: a box that needs another's type cannot be read without it", () => {
    const typed = { modules: [], dependencies: [{ from: "platform/p/a.ts", to: "platform/q/b.ts", typeOnly: true }, { from: "platform/q/b.ts", to: "platform/p/c.ts", typeOnly: false }] };
    expect(boxCycles(typed)).toEqual([["platform/p", "platform/q"]]);
  });

  it("do not count a file needing a file in its own box", () => {
    expect(boxCycles(graph(["platform/p/a.ts", "platform/p/b.ts"], ["platform/p/b.ts", "platform/p/a.ts"]))).toEqual([]);
  });
});

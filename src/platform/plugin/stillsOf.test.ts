import { describe, expect, it } from "vitest";
import { aProgram } from "../program/aProgram";
import { stillsOf } from "./stillsOf";

describe("the stills the build writes", () => {
  it("are each feature's own, and one for every program, by its name", () => {
    const stills = stillsOf([{ name: "one", stills: { drawn: () => "by hand" } }, { name: "two", programs: [aProgram] }]);
    expect(Object.keys(stills).sort()).toEqual(["blueprint", "drawn", "savings"]);
    expect(stills["savings"]?.(() => "", [])).toContain("$ savings");
  });

  it("run a blueprint a page writes, with the nodes every blueprint has and the ones the features bring", () => {
    const stills = stillsOf([{ name: "one" }]);
    expect(stills["blueprint"]?.(() => "", [], 'your-data text: "x, y\\n1, 2\\n2, 4\\n3, 7"\nscatter table: your-data')).toContain("y against x, 3 rows");
  });

  it("keep a still drawn by hand over the one a program would write", () => {
    const stills = stillsOf([{ name: "one", programs: [aProgram], stills: { savings: () => "by hand" } }]);
    expect(stills["savings"]?.(() => "", [])).toBe("by hand");
  });
});

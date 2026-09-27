import { describe, expect, it } from "vitest";
import { aProgram } from "../program/aProgram";
import { stillsOf } from "./stillsOf";

describe("the stills the build writes", () => {
  it("are each feature's own, and one for every program, by its name", () => {
    const stills = stillsOf([{ name: "one", stills: { drawn: () => "by hand" } }, { name: "two", programs: [aProgram] }]);
    expect(Object.keys(stills).sort()).toEqual(["drawn", "savings"]);
    expect(stills["savings"]?.(() => "")).toContain("$ savings");
  });

  it("keep a still drawn by hand over the one a program would write", () => {
    const stills = stillsOf([{ name: "one", programs: [aProgram], stills: { savings: () => "by hand" } }]);
    expect(stills["savings"]?.(() => "")).toBe("by hand");
  });
});

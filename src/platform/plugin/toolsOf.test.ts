import { describe, expect, it } from "vitest";
import { aProgram } from "../program/aProgram";
import { toolsOf } from "./toolsOf";

describe("the tools the features bring", () => {
  it("are their programs, each one a tool that shows the reader what it was asked", () => {
    const tools = toolsOf([{ name: "money", programs: [aProgram] }, { name: "nothing" }]);
    expect(tools.map((tool) => [tool.name, tool.shows])).toEqual([["savings", true]]);
  });
});

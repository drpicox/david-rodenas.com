import { describe, expect, it } from "vitest";
import { aProgram } from "../program/aProgram";
import type { AgentTool } from "./AgentTool";
import { toolsOf } from "./toolsOf";

const writings: AgentTool = {
  name: "writings",
  description: "What was written.",
  inputSchema: { type: "object", properties: {}, required: [], additionalProperties: false },
  readOnly: true,
  shows: false,
  answer: () => ({ summary: "nothing yet" }),
};

describe("the tools the features bring", () => {
  it("are their programs, each one a tool that shows the reader what it was asked", () => {
    const tools = toolsOf([{ name: "money", programs: [aProgram] }, { name: "nothing" }]);
    expect(tools.map((tool) => [tool.name, tool.shows])).toEqual([["savings", true], ["blueprint", true]]);
  });

  it("are, besides, the tools a feature brings as such", () => {
    expect(toolsOf([{ name: "money", programs: [aProgram] }, { name: "words", tools: [writings] }]).map((tool) => tool.name)).toEqual(["savings", "writings", "blueprint"]);
  });
});

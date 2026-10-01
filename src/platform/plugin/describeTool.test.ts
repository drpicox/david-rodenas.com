import { describe, expect, it } from "vitest";
import type { AgentTool } from "./AgentTool";
import { describeTool } from "./describeTool";

const aTool = (shows: boolean): AgentTool => ({
  name: "savings",
  description: "What a sum grows to, left alone.",
  inputSchema: { type: "object", properties: { rate: { type: "number" } }, required: [], additionalProperties: false },
  readOnly: true,
  shows,
  answer: () => ({ summary: "" }),
});

describe("a tool, as the agent is told of it", () => {
  it("says it answers in the same shape as every other tool", () => {
    expect(describeTool(aTool(false)).description).toMatch(/^What a sum grows to, left alone\. Answers as JSON: summary/);
  });

  it("takes a show, true unless the agent says otherwise, when it has something to put in front of the reader", () => {
    const { inputSchema, description } = describeTool(aTool(true));
    expect(inputSchema.properties).toMatchObject({ rate: { type: "number" }, show: { type: "boolean", default: true } });
    expect(description).toContain("shown");
  });

  it("takes no show when it has nothing to show", () => {
    expect(describeTool(aTool(false)).inputSchema.properties).not.toHaveProperty("show");
  });

  it("is marked read-only when it changes nothing the reader has", () => {
    expect(describeTool(aTool(true)).annotations).toEqual({ readOnlyHint: true });
  });
});

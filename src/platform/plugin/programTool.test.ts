import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import { aProgram } from "../program/aProgram";
import { programTool } from "./programTool";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\n# Home\n" },
  { file: "money.md", markdown: "---\ntitle: Money\n---\n# Money\n\n::savings\n" },
]);

describe("a program, as a tool an agent can call", () => {
  const tool = programTool(aProgram);

  it("is named and described by the program, and takes its parameters", () => {
    expect(tool.name).toBe("savings");
    expect(tool.description).toContain("what a sum grows to, left alone");
    expect(tool.inputSchema).toMatchObject({ properties: { rate: { type: "number", maximum: 20 } } });
  });

  it("answers with the program's words and figures, and the page it stands on", async () => {
    expect(await tool.answer({ years: 0 }, { site })).toMatchObject({ summary: "100 €", data: { grown: 100 }, route: "/money/" });
  });

  it("has the program to show the reader, asked what the agent asked, every value settled", async () => {
    expect(await tool.answer({ rate: 0 }, { site })).toMatchObject({ show: { app: "savings", values: { sum: 100, rate: 0, years: 2, paid: "once a year" } } });
    expect(tool.shows).toBe(true);
  });

  it("refuses what the program would refuse, and says why", async () => {
    expect(await tool.answer({ rate: 99 }, { site })).toEqual({ refused: "rate: 99 is outside 0 to 20" });
  });

  it("answers just the same where no page makes room for the program, with no page to give", async () => {
    const answer = await tool.answer({}, { site: new Site([{ file: "index.md", markdown: "# Home\n" }]) });
    expect(answer).toMatchObject({ summary: "121 €" });
    expect(answer).not.toHaveProperty("route");
  });
});

import { describe, expect, it } from "vitest";
import { Site } from "../content/Site";
import { aProgram } from "../program/aProgram";
import { programTool } from "../plugin/programTool";
import { llmsTxtOf } from "./llmsTxtOf";
import { siteTools } from "./siteTools";

const ORIGIN = "https://david-rodenas.com";
const site = new Site([
  { file: "index.md", markdown: "---\ntitle: David Rodenas\nsummary: I lay the foundations.\n---\n# Home\n" },
  { file: "projects/index.md", markdown: "---\ntitle: Projects\nsummary: Small programs.\norder: 10\n---\n# Projects\n" },
  { file: "projects/money.md", markdown: "---\ntitle: Money\nsummary: What a sum grows to.\n---\n# Money\n\n::savings\n" },
  { file: "projects/money-again.md", markdown: "---\nlink: /projects/money/\n---\n" },
  { file: "book/index.md", markdown: "---\ntitle: The book\nsummary: Never rewrite.\norder: 20\n---\n# Book\n" },
]);
const text = llmsTxtOf(site, [...siteTools, programTool(aProgram)], ORIGIN);

describe("the site, as llms.txt tells it to an agent with no browser", () => {
  it("starts with whose site it is and what it says of itself", () => {
    expect(text).toMatch(/^# David Rodenas\n\n> I lay the foundations\.\n/);
  });

  it("lists every page by its address and its summary, under the directory it is in, in the author's order", () => {
    expect(text).toContain("## Projects\n\n- [Projects](https://david-rodenas.com/projects/): Small programs.\n- [Money](https://david-rodenas.com/projects/money/): What a sum grows to.\n");
    expect(text.indexOf("## Projects")).toBeLessThan(text.indexOf("## The book"));
  });

  it("lists a page once, not again at an address that only links to it", () => {
    expect(text.match(/\/projects\/money\//g)).toHaveLength(1);
  });

  it("names the tools a browser with WebMCP is offered, with what each takes", () => {
    expect(text).toContain("## Tools");
    expect(text).toContain("- `read` (path): The words of one page of this site");
    expect(text).toMatch(/- `savings` \(sum, rate, years, paid, show\): what a sum grows to, left alone\./);
    expect(text).toContain("`shell`");
    expect(text).toContain('`savings {"show": false}`');
  });
});

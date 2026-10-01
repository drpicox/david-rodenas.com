import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { essaysOn } from "./essaysOn";
import { talksOn } from "./talksOn";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

/** The pages are the list: written for a reader, read as they are by the tool, so there is no second list to keep. */
describe("the pages the writings are read off", () => {
  it("list every essay in a shape the tool reads, each under a subject, with a line said of it", () => {
    const page = read("../../../content/essays/index.md");
    const essays = essaysOn(page);
    expect(essays.length).toBe(page.split("\n").filter((line) => line.startsWith("- [")).length);
    expect(essays.every((essay) => essay.about && essay.said && essay.url.startsWith("https://"))).toBe(true);
  });

  it("list every dated talk in a shape the tool reads, each with a title in bold", () => {
    const page = read("../../../content/talks/index.md");
    const talks = talksOn(page, "https://david-rodenas.com");
    expect(talks.length).toBe(page.split("\n").filter((line) => line.includes(" :: ")).length);
    expect(talks.every((talk) => talk.title && talk.about && /\d{4}/.test(talk.date))).toBe(true);
  });
});

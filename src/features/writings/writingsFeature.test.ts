import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Site } from "../../platform/content/Site";
import { writingsFeature } from "./writingsFeature";

const nothingServed = () => Promise.reject(new Error("no files here"));

const read = (path: string) => readFileSync(new URL(`../../../content/${path}`, import.meta.url), "utf8");
const site = new Site(["index.md", "essays/index.md", "talks/index.md"].map((file) => ({ file, markdown: read(file) })));

describe("the writings, offered to an agent", () => {
  it("are the essays and talks the site's own pages list, and Medium for the essays they do not", async () => {
    const [tool] = writingsFeature.tools ?? [];
    const answer = (await tool!.answer({ about: "tdd" }, { site, origin: "https://david-rodenas.com", read: nothingServed })) as { data: { essays: unknown[]; talks: unknown[]; more: { essays: { url: string } } } };
    expect(answer.data.essays.length).toBeGreaterThan(0);
    expect(answer.data.talks.length).toBeGreaterThan(0);
    expect(answer.data.more.essays.url).toBe("https://drpicox.medium.com");
  });
});

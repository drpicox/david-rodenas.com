import { describe, expect, it } from "vitest";
import { pageShowing } from "./pageShowing";
import { Site } from "./Site";

const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\nSee ::savings in a sentence, which is not a place.\n" },
  { file: "money.md", markdown: "---\ntitle: Money\n---\n# Money\n\n::savings\n" },
]);

describe("the page a program stands on", () => {
  it("is the one whose markdown makes a place for it on a line of its own", () => {
    expect(pageShowing(site, "savings")?.route).toBe("/money/");
  });

  it("is none, for a program no page makes room for", () => {
    expect(pageShowing(site, "rocket")).toBeUndefined();
  });
});

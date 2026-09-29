import { describe, expect, it } from "vitest";
import { Site } from "../../content/Site";
import { renderMain } from "../../page/renderMain";
import type { ShellContext } from "../../command/Command";
import { find } from "./find";
import { ls } from "./ls";

/**
 * `ls` lists a directory and `find` walks the tree under it, and a directory's
 * own page ends on its list, printed as `ls` would print it; none of the three
 * imports another, but a reader sees all three lists of the same pages, and
 * they have changed together whenever one changed how a list reads. What they
 * agree on is written down here.
 */
const site = new Site([
  { file: "index.md", markdown: "---\ntitle: Home\n---\nHome." },
  { file: "zebra.md", markdown: "---\ntitle: Zebra\norder: 1\n---\nFirst, as the author put it." },
  { file: "apple/index.md", markdown: "---\ntitle: Apple\norder: 2\n---\nSecond." },
  { file: "apple/seed.md", markdown: "---\ntitle: Seed\n---\nInside." },
]);
const context = (): ShellContext => ({ site, cwd: "/", commands: [] });
const lines = (text = "") => text.split("\n");
const first = (line: string) => line.split(/\s+/)[0] ?? "";

describe("ls and find, two lists of the same pages", () => {
  it("go through a directory in the same order, the author's, not the alphabet's", () => {
    const listed = lines(ls.run(context(), []).text)
      .map(first)
      .filter((name) => name !== "README.md" && name !== "..")
      .map((name) => name.replace(/[/@]$/, ""));
    const walked = lines(find.run(context(), []).text)
      .map(first)
      .filter((route) => route.split("/").length === 3)
      .map((route) => route.split("/")[1]);
    expect(listed).toEqual(["zebra", "apple"]);
    expect(walked).toEqual(listed);
  });

  it("list, on a directory's own page, what ls -t lists there, in the same order", () => {
    const home = site.at("/");
    if (!home) throw new Error("no home");
    const table = ls.run(context(), ["-t"]).html ?? "";
    expect(table).not.toBe("");
    expect(renderMain(site, home)).toContain(table);
    const [zebra, apple] = [renderMain(site, home).indexOf('href="/zebra/"'), renderMain(site, home).indexOf('href="/apple/"')];
    expect(zebra).toBeGreaterThan(-1);
    expect(zebra).toBeLessThan(apple);
  });

  it("say every page's title the same way: after its name, lined up, as a comment", () => {
    for (const listing of [ls.run(context(), []), find.run(context(), [])]) {
      const said = lines(listing.text);
      for (const line of said) expect(line).toMatch(/^\S+ +# \S/);
      // Lined up: every title starts in the same column.
      expect(new Set(said.map((line) => line.indexOf("# "))).size).toBe(1);
    }
  });
});

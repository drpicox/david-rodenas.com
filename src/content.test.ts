import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { Site } from "./platform/content/Site";

const CONTENT = new URL("../content", import.meta.url).pathname;

function sourcesIn(directory: string): { file: string; markdown: string }[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourcesIn(path);
    return entry.name.endsWith(".md") ? [{ file: relative(CONTENT, path), markdown: readFileSync(path, "utf8") }] : [];
  });
}

const sources = sourcesIn(CONTENT);
const site = new Site(sources);
const directories = site.pages.filter((page) => site.childrenOf(page.route).length > 0);

/**
 * Claims about the site as written, not about the code: the order a reader
 * meets things in is the author's, so it must be one the author chose, and a
 * directory's page is where a stranger learns what is in it.
 */
describe("the content", () => {
  it("never leaves two pages in a directory to the alphabet: every order is chosen", () => {
    const ties = directories.flatMap((directory) => {
      const orders = site.childrenOf(directory.route).map((child) => `${child.order}`);
      return orders.filter((order, i) => orders.indexOf(order) !== i).map((order) => `${directory.route} order ${order}`);
    });
    expect(ties).toEqual([]);
  });

  it("has no link that leads nowhere", () => {
    const links = sources.filter(({ markdown }) => /^link:/m.test(markdown)).map(({ file }) => file);
    expect(site.links).toHaveLength(links.length);
  });

  it("names every page of a directory on the directory's own page, so it can be read without ls", () => {
    const unnamed = directories.flatMap((directory) =>
      directory.parent === null ? [] : site.childrenOf(directory.route).filter((child) => !directory.body.includes(`](${child.route})`)).map((child) => `${directory.route} → ${child.route}`),
    );
    expect(unnamed).toEqual([]);
  });
});

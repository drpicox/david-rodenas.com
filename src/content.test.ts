import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { allFeatures } from "./features/allFeatures";
import { Site } from "./platform/content/Site";
import { renderMain } from "./platform/page/renderMain";
import { stillsOf } from "./platform/plugin/stillsOf";

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

/**
 * The founding rule: the content is in the HTML. A figure made of data is
 * content, and a page names the place where one stands; the build fills each
 * place with its still, reading the data from where the browser will fetch it,
 * and a still that fails leaves its place empty without failing the build.
 * So it is said here, of every page as written.
 */
describe("the content, in the HTML", () => {
  const PLACE = /<div class="app" data-app="([a-z0-9-]+)"(?: data-dials="([a-z0-9 -]+)")?><\/div>/g;
  const PUBLIC = new URL("../public", import.meta.url).pathname;
  const read = (path: string) => readFileSync(join(PUBLIC, path), "utf8");
  const stills = stillsOf(allFeatures);
  const apps = new Set(allFeatures.flatMap((feature) => Object.keys(feature.apps ?? {})));
  const places = site.pages.flatMap((page) => [...renderMain(site, page).matchAll(PLACE)].map(([, name = "", dials]) => ({ route: page.route, name, dials: dials ? dials.split(" ") : [] })));

  it("gives every place a page names a program that runs there, or a still that stands there", () => {
    expect(places.filter(({ name }) => !apps.has(name) && !stills[name]).map(({ route, name }) => `${route} ::${name}`)).toEqual([]);
  });

  it("fills, on every page, every place that has a still, as the build does, and no still fails or draws nothing", () => {
    const failed = places.flatMap(({ route, name, dials }) => {
      const still = stills[name];
      if (!still) return [];
      try {
        return still(read, dials).trim() ? [] : [`${route} ::${name}: nothing drawn`];
      } catch (error) {
        return [`${route} ::${name}: ${error instanceof Error ? error.message : String(error)}`];
      }
    });
    expect(failed).toEqual([]);
    expect(places.length).toBeGreaterThan(10);
  });
});


import { describe, expect, it } from "vitest";
import { Site } from "./Site";
import { nameOf, parentOf, routeOf } from "./routeOf";

describe("routeOf", () => {
  it("puts the root index at the root", () => {
    expect(routeOf("index.md")).toBe("/");
  });

  it("makes a file into a directory-looking URL", () => {
    expect(routeOf("whoami.md")).toBe("/whoami/");
    expect(routeOf("work/orion.md")).toBe("/work/orion/");
  });

  it("lets a directory speak for itself through its index", () => {
    expect(routeOf("work/index.md")).toBe("/work/");
  });
});

describe("parentOf and nameOf", () => {
  it("knows where a route is listed", () => {
    expect(parentOf("/work/orion/")).toBe("/work/");
    expect(parentOf("/work/")).toBe("/");
    expect(parentOf("/")).toBeNull();
  });

  it("knows what a listing calls it", () => {
    expect(nameOf("/work/orion/")).toBe("orion");
    expect(nameOf("/")).toBe("/");
  });
});

const SOURCES = [
  { file: "index.md", markdown: "---\ntitle: Home\n---\nhi" },
  { file: "work/index.md", markdown: "---\ntitle: Work\norder: 1\n---\nfive times" },
  { file: "work/orion.md", markdown: "---\ntitle: Orion\norder: 2\n---\na kernel" },
  { file: "work/mgc.md", markdown: "---\ntitle: MGC\norder: 1\n---\nplanets" },
  { file: "whoami.md", markdown: "no front matter at all" },
];

describe("Site", () => {
  const site = new Site(SOURCES);

  it("finds a page by its address", () => {
    expect(site.at("/work/orion/")?.title).toBe("Orion");
  });

  it("falls back to the file name when there is no title", () => {
    expect(site.at("/whoami/")?.title).toBe("whoami");
  });

  it("lists a directory in the order the author asked for", () => {
    expect(site.childrenOf("/work/").map((page) => page.name)).toEqual(["mgc", "orion"]);
  });

  it("does not list a directory inside itself", () => {
    expect(site.childrenOf("/").map((page) => page.name)).toEqual(["work", "whoami"]);
  });

  it("walks the trail down to a page", () => {
    expect(site.trailTo("/work/orion/").map((page) => page.route)).toEqual(["/", "/work/", "/work/orion/"]);
  });

  it("has no trail to an address that does not exist", () => {
    expect(site.trailTo("/nope/")).toEqual([]);
  });
});

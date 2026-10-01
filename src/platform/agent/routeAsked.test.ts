import { describe, expect, it } from "vitest";
import { routeAsked } from "./routeAsked";

describe("the route an agent meant", () => {
  it("is the same however the address was written: a path, a URL, a README.md, no slashes", () => {
    for (const path of ["projects/rocket", "/projects/rocket", "https://david-rodenas.com/projects/rocket/", "/projects/rocket/README.md", "/projects/rocket/?x=1#top", " ./projects//rocket/ "]) {
      expect(routeAsked(path)).toBe("/projects/rocket/");
    }
  });

  it("is the root for the root, or for nothing at all", () => {
    for (const path of ["/", "", "README.md", "http://localhost:5173/"]) expect(routeAsked(path)).toBe("/");
  });
});

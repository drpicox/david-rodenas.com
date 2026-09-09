import { describe, expect, it } from "vitest";
import { isHere } from "./isHere";

describe("isHere", () => {
  it("says a reader inside a directory is at that directory's entry in the navigation", () => {
    expect(isHere("/work/orion/", "/work/")).toBe(true);
    expect(isHere("/work/", "/work/")).toBe(true);
    expect(isHere("/notes/", "/work/")).toBe(false);
  });

  it("marks the root's own entry only at the root, because every route is under it", () => {
    expect(isHere("/", "/")).toBe(true);
    expect(isHere("/work/orion/", "/")).toBe(false);
  });
});

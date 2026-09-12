import { describe, expect, it } from "vitest";
import { isHere } from "./isHere";

describe("isHere", () => {
  it("marks a directory as here for itself and for what it holds", () => {
    expect(isHere("/work/", "/work/")).toBe(true);
    expect(isHere("/work/orion/", "/work/")).toBe(true);
  });

  it("does not mistake a longer name for a directory: /worked/ is not in /work/", () => {
    expect(isHere("/worked/", "/work/")).toBe(false);
  });

  it("marks the root only at the root, since every page is inside it", () => {
    expect(isHere("/", "/")).toBe(true);
    expect(isHere("/work/", "/")).toBe(false);
  });
});

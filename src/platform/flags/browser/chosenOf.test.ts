// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { chosenOf } from "./chosenOf";

describe("the choice a flag with choices is at", () => {
  it("is read off the root, where the head script and the flags command write it", () => {
    const root = document.createElement("html");
    root.dataset["flags"] = "portfolio search=palette";
    expect(chosenOf("search", root)).toBe("palette");
  });

  it("is none while the flag is off, or a flag of that name is only on", () => {
    const root = document.createElement("html");
    root.dataset["flags"] = "searchlight=on search";
    expect(chosenOf("search", root)).toBeNull();
    expect(chosenOf("search", document.createElement("html"))).toBeNull();
  });
});

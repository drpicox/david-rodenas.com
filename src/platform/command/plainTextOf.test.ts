import { describe, expect, it } from "vitest";
import { plainTextOf } from "./plainTextOf";

describe("what a command answered, for a reader with no screen", () => {
  it("is its text, when it has one", () => {
    expect(plainTextOf({ text: "a b", html: "<b>a</b> b" })).toBe("a b");
  });

  it("is its markup's words when it printed only markup, a page among them, a block to a line", () => {
    expect(plainTextOf({ html: "<h1>Title</h1><p>One &amp; <em>two</em>.</p><p>Three</p>" })).toBe("Title\nOne & two.\nThree");
  });

  it("is nothing when nothing was printed", () => {
    expect(plainTextOf({ at: "/" })).toBe("");
  });
});

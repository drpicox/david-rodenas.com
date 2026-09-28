import { describe, expect, it } from "vitest";
import { lineDiff } from "./lineDiff";

const kinds = (before: string, after: string) => lineDiff(before, after).map(({ kind, line }) => `${kind[0]} ${line}`);

describe("what a commit did to a file, line by line", () => {
  it("marks the lines it added, where they went", () => {
    expect(kinds("a\nb\nc", "a\nx\nb\nc")).toEqual(["s a", "a x", "s b", "s c"]);
  });

  it("keeps the lines it removed, where they were, so they can be seen going", () => {
    expect(kinds("a\nx\nb", "a\nb")).toEqual(["s a", "r x", "s b"]);
  });

  it("shows a changed line as the old one going and the new one coming, in that order", () => {
    expect(kinds("a\nold\nb", "a\nnew\nb")).toEqual(["s a", "r old", "a new", "s b"]);
  });

  it("adds every line of a file that did not exist, and removes nothing", () => {
    expect(kinds("", "a\nb")).toEqual(["a a", "a b"]);
  });
});

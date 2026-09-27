import { describe, expect, it } from "vitest";
import { changedLines } from "./changedLines";

describe("the lines a commit changed", () => {
  it("are the ones the file did not have before", () => {
    expect(changedLines("a\nb\nc", "a\nx\nb\nc")).toEqual([false, true, false, false]);
  });

  it("counts a line that moved as changed, and the rest as kept", () => {
    expect(changedLines("a\nb\nc", "c\na\nb")).toEqual([true, false, false]);
  });

  it("are all of them in a file that did not exist", () => {
    expect(changedLines("", "a\nb")).toEqual([true, true]);
  });
});

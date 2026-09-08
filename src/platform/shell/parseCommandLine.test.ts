import { describe, expect, it } from "vitest";
import { parseCommandLine } from "./parseCommandLine";

describe("parseCommandLine", () => {
  it("splits a line into words", () => {
    expect(parseCommandLine("cd  book ")).toEqual([["cd", "book"]]);
  });

  it("runs several commands from one line, with ; or &&", () => {
    expect(parseCommandLine("cd book && cat *; ls")).toEqual([["cd", "book"], ["cat", "*"], ["ls"]]);
  });

  it("has nothing to say about an empty line", () => {
    expect(parseCommandLine("   ")).toEqual([]);
  });
});

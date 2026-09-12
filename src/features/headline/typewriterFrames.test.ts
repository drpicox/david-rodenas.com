import { describe, expect, it } from "vitest";
import { typewriterFrames } from "./typewriterFrames";

describe("typewriterFrames", () => {
  it("takes the old text back a character at a time to nothing, then puts the new one down a character at a time", () => {
    expect(typewriterFrames("ab", "cde")).toEqual(["a", "", "c", "cd", "cde"]);
  });

  it("treats a line break as one more character, so a two-line headline is typed line by line", () => {
    const frames = typewriterFrames("", "a\nb");
    expect(frames).toEqual(["a", "a\n", "a\nb"]);
  });

  it("from nothing, only types", () => {
    expect(typewriterFrames("", "x")).toEqual(["x"]);
  });
});

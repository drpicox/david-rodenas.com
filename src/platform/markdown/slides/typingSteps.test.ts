import { describe, expect, it } from "vitest";
import { typingSteps } from "./typingSteps";

describe("the keystrokes from one text to the next", () => {
  it("types a text from nothing, a letter at a time", () => {
    expect(typingSteps("", "abc")).toEqual([
      { text: "a", caret: 1 },
      { text: "ab", caret: 2 },
      { text: "abc", caret: 3 },
    ]);
  });

  it("rubs out only what changed, from its end, and types what replaces it, keeping the rest", () => {
    expect(typingSteps('toBe(300);', 'toBe("fail");').map((step) => step.text)).toEqual([
      "toBe(30);",
      "toBe(3);",
      "toBe();",
      'toBe(");',
      'toBe("f);',
      'toBe("fa);',
      'toBe("fai);',
      'toBe("fail);',
      'toBe("fail");',
    ]);
  });

  it("has nothing to type when nothing changed", () => {
    expect(typingSteps("same", "same")).toEqual([]);
  });
});

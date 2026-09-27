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

  it("types a new line from the end of the one above it, as a person does, and never runs it into the brace below", () => {
    const texts = typingSteps("{\n  a;\n}", "{\n  a;\n  b;\n}").map((step) => step.text);
    expect(texts).toContain("{\n  a;\n  b\n}");
    expect(texts).not.toContain("{\n  a;\n  b}");
    expect(texts.at(-1)).toBe("{\n  a;\n  b;\n}");
  });

  it("rubs out a whole line from its end, leaving the brace below where it was", () => {
    const texts = typingSteps("{\n  a;\n  b;\n}", "{\n  a;\n}").map((step) => step.text);
    expect(texts).toContain("{\n  a;\n  b\n}");
    expect(texts.at(-1)).toBe("{\n  a;\n}");
  });

  it("has nothing to type when nothing changed", () => {
    expect(typingSteps("same", "same")).toEqual([]);
  });
});

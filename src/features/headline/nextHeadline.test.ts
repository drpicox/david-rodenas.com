import { describe, expect, it } from "vitest";
import { nextHeadline } from "./nextHeadline";

describe("nextHeadline", () => {
  it("never picks the headline that is showing", () => {
    for (const random of [0, 0.3, 0.5, 0.99]) expect(nextHeadline("b", ["a", "b", "c"], random)).not.toBe("b");
  });

  it("reaches every other headline as the number runs from 0 to 1", () => {
    expect(nextHeadline("b", ["a", "b", "c"], 0)).toBe("a");
    expect(nextHeadline("b", ["a", "b", "c"], 0.99)).toBe("c");
  });

  it("with nothing else to say, says the same", () => {
    expect(nextHeadline("a", ["a"], 0.5)).toBe("a");
  });
});

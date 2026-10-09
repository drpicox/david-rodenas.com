import { describe, expect, it } from "vitest";
import { steppedTo } from "./steppedTo";

describe("the one chosen of a list, after an arrow key", () => {
  it("is the next one down or up, round from the last to the first and back", () => {
    expect(steppedTo(0, 3, "ArrowDown")).toBe(1);
    expect(steppedTo(2, 3, "ArrowDown")).toBe(0);
    expect(steppedTo(0, 3, "ArrowUp")).toBe(2);
  });

  it("is the same for any other key, and none in an empty list", () => {
    expect(steppedTo(1, 3, "a")).toBe(1);
    expect(steppedTo(0, 0, "ArrowDown")).toBe(-1);
  });
});

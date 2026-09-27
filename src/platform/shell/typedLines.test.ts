import { describe, expect, it } from "vitest";
import { typedLines } from "./typedLines";

describe("the keys pressed before the prompt could listen", () => {
  it("are the lines Enter finished, and the one still being typed", () => {
    expect(typedLines(["l", "s", "Enter", "c", "d"])).toEqual({ finished: ["ls"], unfinished: "cd" });
  });

  it("take Backspace back, as the prompt would have", () => {
    expect(typedLines(["c", "x", "Backspace", "d", "Enter"])).toEqual({ finished: ["cd"], unfinished: "" });
  });

  it("are nothing when nothing was pressed", () => {
    expect(typedLines([])).toBeNull();
  });
});

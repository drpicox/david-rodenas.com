import { describe, expect, it } from "vitest";
import { editLine } from "./editLine";

describe("editLine", () => {
  it("kills from the caret to the end of the line, and keeps what it killed", () => {
    expect(editLine("k", "cd worlds", 3, "")).toEqual({ line: "cd ", caret: 3, killed: "worlds" });
  });

  it("kills from the start of the line to the caret", () => {
    expect(editLine("u", "cd worlds", 3, "")).toEqual({ line: "worlds", caret: 0, killed: "cd " });
  });

  // Nothing to kill is not the same as killing nothing: the buffer has to survive it.
  it("leaves the buffer alone when there is nothing to kill", () => {
    expect(editLine("k", "cd", 2, "worlds")).toEqual({ line: "cd", caret: 2, killed: "worlds" });
    expect(editLine("u", "cd", 0, "worlds")).toEqual({ line: "cd", caret: 0, killed: "worlds" });
  });

  it("yanks what was killed back in at the caret, and leaves the caret after it", () => {
    expect(editLine("y", "cd ", 3, "worlds")).toEqual({ line: "cd worlds", caret: 9, killed: "worlds" });
  });

  it("yanks nothing when nothing has been killed", () => {
    expect(editLine("y", "cd ", 3, "")).toEqual({ line: "cd ", caret: 3, killed: "" });
  });

  // The three together are how a line gets rearranged without the mouse.
  it("moves a word: kill it here, yank it there", () => {
    const killed = editLine("u", "worlds cat README.md", 7, "");
    expect(killed).toEqual({ line: "cat README.md", caret: 0, killed: "worlds " });
    expect(editLine("y", killed?.line ?? "", 4, killed?.killed ?? "")).toEqual({
      line: "cat worlds README.md",
      caret: 11,
      killed: "worlds ",
    });
  });

  it("says nothing about a key that is not one of its own", () => {
    expect(editLine("a", "cd worlds", 3, "")).toBeNull();
    expect(editLine("Enter", "cd worlds", 3, "")).toBeNull();
  });
});

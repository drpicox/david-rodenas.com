import { describe, expect, it } from "vitest";
import { readSlides } from "./readSlides";

describe("a block of slides, read into its frames", () => {
  it("closes a frame at each line of dashes, with what the tests said, red or green, or a note", () => {
    expect(readSlides(["a = 1", "--- red Expected: 2. Received: 1.", "a = 2", "--- green All tests pass.", "done", "--- It reads well."].join("\n"))).toEqual([
      { text: "a = 1", status: { kind: "red", text: "Expected: 2. Received: 1." } },
      { text: "a = 2", status: { kind: "green", text: "All tests pass." } },
      { text: "done", status: { kind: "note", text: "It reads well." } },
    ]);
  });

  it("keeps a frame's lines as they are, and takes what is left after the last dashes as a frame with nothing said", () => {
    expect(readSlides(["  one", "  two", "---", "three"].join("\n"))).toEqual([{ text: "  one\n  two" }, { text: "three" }]);
  });
});

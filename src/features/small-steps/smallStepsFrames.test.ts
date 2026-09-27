import { describe, expect, it } from "vitest";
import { smallStepsFrames } from "./smallStepsFrames";

describe("small steps, frame by frame", () => {
  const frames = smallStepsFrames(["test", "clean", "test"]);
  const shown = frames.map((frame) => frame.marks.join(" "));

  it("shows a failing test red, then goes back to it and puts it right, before the next step", () => {
    expect(shown.slice(0, 6)).toEqual([
      "empty empty empty",
      "red empty empty",
      "fixed empty empty",
      "fixed clean empty",
      "fixed clean red",
      "fixed clean fixed",
    ]);
  });

  it("keeps a red long enough to be seen being put right, and the whole row longer, before wiping it from the left", () => {
    expect(frames[1]?.hold).toBeGreaterThanOrEqual(800);
    expect(frames[1]?.hold).toBeGreaterThan(frames[2]?.hold ?? Infinity);
    expect(frames[5]?.hold).toBeGreaterThan(frames[1]?.hold ?? Infinity);
    expect(shown.slice(6)).toEqual(["empty clean fixed", "empty empty fixed", "empty empty empty"]);
  });

  it("never leaves a red behind: every row it fills is green", () => {
    expect(shown[5]).not.toContain("red");
  });

  it("rests on its full row, unwiped, when it is the last run", () => {
    const last = smallStepsFrames(["test", "clean"], { wipe: false });
    expect(last.map((frame) => frame.marks.join(" ")).at(-1)).toBe("fixed clean");
  });
});

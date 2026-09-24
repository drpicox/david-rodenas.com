import { describe, expect, it } from "vitest";
import { glyphs } from "./glyphs";
import { readOwnShapes } from "./readOwnShapes";

describe("the visitor's own letters, read back from what the browser kept", () => {
  it("gives back what was written", () => {
    const kept = [{ name: "Z", pixels: glyphs.T! }];
    expect(readOwnShapes(JSON.stringify(kept))).toEqual(kept);
  });

  it("starts with none when nothing was kept, or what was kept is not ours", () => {
    expect(readOwnShapes(null)).toEqual([]);
    expect(readOwnShapes("{")).toEqual([]);
    expect(readOwnShapes('{"name":"Z"}')).toEqual([]);
  });

  it("drops a drawing that is not twenty-five cells of ink or paper, or has no fit name, and keeps the rest", () => {
    const text = JSON.stringify([
      { name: "Z", pixels: glyphs.T! },
      { name: "Y", pixels: [1, 0, 1] },
      { name: "W", pixels: glyphs.T!.map((pixel) => pixel * 2) },
      { name: "", pixels: glyphs.T! },
      { name: "long", pixels: glyphs.T! },
      { name: "Z", pixels: glyphs.X! },
    ]);
    expect(readOwnShapes(text).map(({ name }) => name)).toEqual(["Z"]);
  });
});

import { describe, expect, it } from "vitest";
import { glyphs } from "./glyphs";
import { shapeProblem } from "./shapeProblem";

const taken = ["A", "B", ":)"];

describe("what stops a drawing from being remembered", () => {
  it("lets a new name and some ink through", () => {
    expect(shapeProblem("Z", glyphs.T!, taken)).toBeNull();
    expect(shapeProblem(" ok ", glyphs.T!, taken)).toBeNull();
  });

  it("wants a name, of three characters at most", () => {
    expect(shapeProblem("  ", glyphs.T!, taken)).toMatch(/name/);
    expect(shapeProblem("four", glyphs.T!, taken)).toMatch(/three/);
  });

  it("will not give two drawings the same name, the network could not say which it meant", () => {
    expect(shapeProblem("A", glyphs.T!, taken)).toMatch(/already/);
    expect(shapeProblem(":)", glyphs.T!, taken)).toMatch(/already/);
  });

  it("will not remember an empty grid", () => {
    expect(shapeProblem("Z", new Array(25).fill(0), taken)).toMatch(/ink/);
  });
});

import { describe, expect, it } from "vitest";
import { generateWorld } from "./generateWorld";
import { growWorld } from "./growWorld";
import { HEADER_RECIPE } from "./WorldRecipe";

describe("growWorld", () => {
  it("grows the header's world from the header's recipe", () => {
    const fromRecipe = growWorld({ ...HEADER_RECIPE, seed: 9 });
    expect([...fromRecipe.mesh.radii]).toEqual([...generateWorld(9).mesh.radii]);
    expect([...fromRecipe.faceColour]).toEqual([...generateWorld(9).faceColour]);
  });

  it("has 20 × 4^levels triangles", () => {
    expect(growWorld({ ...HEADER_RECIPE, seed: 1 }).mesh.faceCount).toBe(5120);
    expect(growWorld({ ...HEADER_RECIPE, seed: 1, levels: 3 }).mesh.faceCount).toBe(1280);
  });

  it("puts more of the world under water when asked to", () => {
    const dry = growWorld({ ...HEADER_RECIPE, seed: 2, share: 0.3 });
    const wet = growWorld({ ...HEADER_RECIPE, seed: 2, share: 0.8 });
    expect(wet.seaRadius).toBeGreaterThan(dry.seaRadius);
  });
});

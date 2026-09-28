import { describe, expect, it } from "vitest";
import { heatOf } from "./heatOf";
import type { Life } from "./Life";

const life = (id: number, born: number, changed: number[]): Life => ({ id, path: `${id}.ts`, lines: 1, test: false, typesOnly: false, born, changed });

describe("how hot each file is at a commit", () => {
  const lives = [life(0, 0, [2, 10]), life(1, 0, [4]), life(2, 3, []), life(3, 0, [12])];

  it("is one for a change at that very commit, and half again every half-life after", () => {
    const heat = heatOf(lives, 10, 6);
    expect(heat.get(0)).toBeCloseTo(1 + 0.5 ** (8 / 6));
    expect(heat.get(1)).toBeCloseTo(0.5);
  });

  it("is nothing for a file that never changed, nor for a change still to come", () => {
    const heat = heatOf(lives, 10, 6);
    expect(heat.get(2)).toBe(0);
    expect(heat.get(3)).toBe(0);
  });

  it("leaves a sweep out: a rename across the source warms nothing", () => {
    expect(heatOf([life(0, 0, [2, 10])], 10, 6, new Set([10])).get(0)).toBeCloseTo(0.5 ** (8 / 6));
  });
});

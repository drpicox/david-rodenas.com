import { describe, expect, it } from "vitest";
import { changesUpTo } from "./changesUpTo";
import type { Life } from "./Life";

const life = (id: number, changed: number[]): Life => ({ id, path: `${id}.ts`, lines: 1, test: false, typesOnly: false, born: 0, changed });

describe("how often each file has changed, by a commit", () => {
  it("counts the commits that changed each file, up to and with the one shown", () => {
    expect(changesUpTo([life(0, [1, 3, 7]), life(1, [2]), life(2, [])], 3)).toEqual(new Map([[0, 2], [1, 1], [2, 0]]));
  });

  it("leaves a sweep out", () => {
    expect(changesUpTo([life(0, [1, 3, 7])], 7, new Set([3])).get(0)).toBe(2);
  });
});

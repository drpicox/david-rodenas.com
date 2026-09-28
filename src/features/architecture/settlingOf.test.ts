import { describe, expect, it } from "vitest";
import type { Life } from "./Life";
import { settlingOf } from "./settlingOf";

const life = (id: number, born: number, changed: number[], went?: number): Life => ({ id, path: `${id}.ts`, lines: 10, test: false, typesOnly: false, born, changed, ...(went === undefined ? {} : { went }) });

// Nine commits. One file written at the first and changed at ages 1, 2 and 5; one written at the third, changed at age 1, gone at age 3; one written at the eighth, never changed.
const lives = [life(0, 0, [1, 2, 5]), life(1, 2, [3], 5), life(2, 7, [])];

describe("how a file settles", () => {
  const bands = settlingOf(lives, 9);

  it("groups the ages in bands that double, as far as the oldest file got", () => {
    expect(bands.map(({ from, to }) => [from, to])).toEqual([
      [1, 1],
      [2, 2],
      [3, 4],
      [5, 8],
    ]);
  });

  it("counts, at each age, the commits the files lived through and the ones that changed them", () => {
    expect(bands.map(({ lived, changed }) => [lived, changed])).toEqual([
      [3, 2],
      [2, 1],
      [2, 0],
      [4, 1],
    ]);
  });

  it("cuts the last band where the oldest file stops", () => {
    expect(settlingOf(lives, 10).at(-1)).toEqual({ from: 9, to: 9, lived: 1, changed: 0 });
  });
});

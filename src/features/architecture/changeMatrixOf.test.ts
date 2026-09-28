import { describe, expect, it } from "vitest";
import { changeMatrixOf } from "./changeMatrixOf";
import type { Life } from "./Life";

const life = (path: string, born: number, changed: number[], went?: number): Life => ({ id: 0, path, lines: 10, test: path.endsWith(".test.ts"), typesOnly: false, born, changed, ...(went === undefined ? {} : { went }) });
const lives = [
  life("platform/p/a.ts", 0, [2, 3]),
  life("platform/p/b.ts", 1, [3]),
  life("features/f/c.ts", 2, [3, 4]),
  life("features/g/d.ts", 1, []),
  life("main.ts", 0, [4]),
  life("core/x.ts", 0, [1], 2),
  life("features/f/c.test.ts", 2, [3]),
];

describe("where the changes went, box by box and commit by commit", () => {
  const rows = changeMatrixOf(lives, ["src", "features", "platform"]);

  it("has a row for every box there is now, band by band in the order given, and inside a band the oldest first", () => {
    expect(rows.map(({ box, band }) => [box, band])).toEqual([
      ["main.ts", "src"],
      ["features/g", "features"],
      ["features/f", "features"],
      ["platform/p", "platform"],
      [null, null],
    ]);
  });

  it("counts, at every commit that touched a box, the files it changed there and the files it wrote", () => {
    expect(rows[3]?.cells).toEqual([
      [0, 0, 1],
      [1, 0, 1],
      [2, 1, 0],
      [3, 2, 0],
    ]);
  });

  it("puts a file where it stands now, over its whole life, and the files that are gone in a row of their own", () => {
    expect(rows[4]?.cells).toEqual([
      [0, 0, 1],
      [1, 1, 0],
    ]);
  });

  it("leaves the tests out, which change with what they test", () => {
    expect(rows[2]?.cells).toEqual([
      [2, 0, 1],
      [3, 1, 0],
      [4, 1, 0],
    ]);
  });
});

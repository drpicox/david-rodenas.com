import { describe, expect, it } from "vitest";
import type { Life } from "./Life";
import { matrixCellsOf } from "./matrixCellsOf";

const life = (id: number, path: string, born: number, changed: number[], went?: number): Life => ({ id, path, lines: 1, test: path.endsWith(".test.ts"), typesOnly: false, born, changed, ...(went === undefined ? {} : { went }) });

describe("what each cell of the picture of changes holds", () => {
  const cells = matrixCellsOf([life(0, "platform/page/render.ts", 0, [2, 3]), life(1, "platform/page/main.ts", 2, [3]), life(2, "core/old.ts", 0, [2], 3), life(3, "platform/page/render.test.ts", 0, [2])]);

  it("names the files a commit changed in a box, and the ones it wrote there", () => {
    expect(cells.get("platform/page", 2)).toEqual({ changed: ["platform/page/render.ts"], written: ["platform/page/main.ts"] });
    expect(cells.get("platform/page", 3)).toEqual({ changed: ["platform/page/main.ts", "platform/page/render.ts"], written: [] });
  });

  it("keeps the files that are gone in a row of their own, and the tests out", () => {
    expect(cells.get(null, 2)).toEqual({ changed: ["core/old.ts"], written: [] });
    expect(cells.get("platform/page", 0)).toEqual({ changed: [], written: ["platform/page/render.ts"] });
  });

  it("has nothing for a commit that did nothing in a box", () => {
    expect(cells.get("platform/page", 1)).toEqual({ changed: [], written: [] });
  });
});
